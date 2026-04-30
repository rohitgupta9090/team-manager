from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


def _create_local_user(validated_data):
    """Create user after signup / admin-create; avoids 500 on unique violations and aligns with Django password rules."""
    password = validated_data.pop("password")
    user = User(**validated_data)
    try:
        validate_password(password, user)
    except DjangoValidationError as exc:
        raise serializers.ValidationError({"password": list(exc.messages)})
    user.set_password(password)
    try:
        user.save()
    except IntegrityError:
        raise serializers.ValidationError(
            {
                "email": ["An account with this email or login ID already exists. Try signing in."],
                "username": ["An account with this email or login ID already exists. Try signing in."],
            },
        ) from None
    return user


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.MEMBER)

    class Meta:
        model = User
        fields = ("username", "email", "password", "role")

    def create(self, validated_data):
        return _create_local_user(validated_data)


class AdminCreateUserSerializer(serializers.ModelSerializer):
    """Admin-only: create a user with an explicit role (preserves public signup rules elsewhere)."""

    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "role")
        read_only_fields = ("id",)

    def create(self, validated_data):
        return _create_local_user(validated_data)


class UserBriefSerializer(serializers.ModelSerializer):
    """`name` mirrors profiles.name in the Supabase schema for the same UI."""

    name = serializers.CharField(source="username", read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "name")


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Optional expected_role ensures the client's radio matches the server's stored RBAC."""

    expected_role = serializers.ChoiceField(
        choices=User.Role.choices,
        write_only=True,
        required=False,
    )

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["username"] = user.username
        return token

    def validate(self, attrs):
        expected_role = attrs.pop("expected_role", None)
        data = super().validate(attrs)
        if expected_role is not None and self.user.role != expected_role:
            raise serializers.ValidationError(
                {
                    "detail": (
                        f'This email is registered as "{self.user.role}". '
                        f'Pick that role above when signing in, or speak to an Administrator.'
                    )
                },
            )
        data["user"] = UserBriefSerializer(self.user).data
        return data
