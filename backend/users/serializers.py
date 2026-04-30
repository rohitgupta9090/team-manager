from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.MEMBER)

    class Meta:
        model = User
        fields = ("username", "email", "password", "role")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminCreateUserSerializer(serializers.ModelSerializer):
    """Admin-only: create a user with an explicit role (preserves public signup rules elsewhere)."""

    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "role")
        read_only_fields = ("id",)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


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
