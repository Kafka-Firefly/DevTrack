import json

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from projects.models import Project


def user_payload(user):
    return {"id": user.id, "username": user.get_username()}


@ensure_csrf_cookie
@require_GET
def csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set."})


@require_GET
def current_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required."}, status=401)
    return JsonResponse(user_payload(request.user))


@csrf_protect
@require_POST
def register_view(request):
    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON."}, status=400)

    username = str(data.get("username", "")).strip()
    password = data.get("password", "")
    if not username or not isinstance(password, str):
        return JsonResponse({"detail": "Username and password are required."}, status=400)

    User = get_user_model()
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({"username": ["This username is already taken."]}, status=400)
    try:
        validate_password(password)
    except ValidationError as error:
        return JsonResponse({"password": list(error.messages)}, status=400)

    user = User.objects.create_user(username=username, password=password)
    # Preserve any projects created before accounts were introduced by assigning
    # legacy unowned projects to the first account that registers.
    if not User.objects.exclude(pk=user.pk).exists():
        Project.objects.filter(owner__isnull=True).update(owner=user)
    login(request, user)
    return JsonResponse(user_payload(user), status=201)


@csrf_protect
@require_POST
def login_view(request):
    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON."}, status=400)
    user = authenticate(request, username=data.get("username", ""), password=data.get("password", ""))
    if user is None:
        return JsonResponse({"detail": "Username or password is incorrect."}, status=401)
    login(request, user)
    return JsonResponse(user_payload(user))


@csrf_protect
@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"detail": "Signed out."})
