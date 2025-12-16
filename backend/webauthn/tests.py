from django.test import TestCase
from django.contrib.auth.models import User
from webauthn.models import UserProfile


class UserProfileModelTest(TestCase):
    """Test cases for UserProfile model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword123",
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
        )

    def test_profile_creation(self):
        """Test that a user profile can be created successfully."""
        self.assertEqual(self.profile.user.username, "testuser")
        self.assertEqual(self.profile.user.email, "testuser@example.com")

    def test_profile_str_representation(self):
        """Test the string representation of profile."""
        self.assertEqual(str(self.profile), "testuser")

    def test_profile_user_relationship(self):
        """Test the OneToOne relationship with User."""
        self.assertEqual(self.profile.user, self.user)

    def test_profile_without_image(self):
        """Test that user_profile_img can be null."""
        self.assertIsNone(self.profile.user_profile_img)

    def test_profile_with_image(self):
        """Test creating a profile with a base64 image."""
        self.profile.user_profile_img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        self.profile.save()
        self.assertIsNotNone(self.profile.user_profile_img)

    def test_profile_cascade_delete(self):
        """Test that profile is deleted when user is deleted."""
        user_id = self.user.id
        self.user.delete()
        profile_count = UserProfile.objects.filter(user_id=user_id).count()
        self.assertEqual(profile_count, 0)

    def test_one_to_one_constraint(self):
        """Test that a user can only have one profile."""
        with self.assertRaises(Exception):
            UserProfile.objects.create(user=self.user)


class UserAuthenticationTest(TestCase):
    """Test cases for user authentication."""

    def test_user_creation(self):
        """Test that a user can be created."""
        user = User.objects.create_user(
            username="newuser",
            email="newuser@example.com",
            password="securepassword123",
        )
        self.assertEqual(user.username, "newuser")
        self.assertTrue(user.check_password("securepassword123"))

    def test_user_email_validation(self):
        """Test user with valid email."""
        user = User.objects.create_user(
            username="emailuser",
            email="valid@email.com",
            password="password123",
        )
        self.assertEqual(user.email, "valid@email.com")

    def test_superuser_creation(self):
        """Test that a superuser can be created."""
        admin = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpassword123",
        )
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_staff)
