from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'},
            status=400
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'That username is already taken.'},
            status=400
        )

    if len(password) < 6:
        return Response(
            {'error': 'Password must be at least 6 characters.'},
            status=400
        )

    user = User.objects.create_user(
        username=username, email=email, password=password
    )
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'username': user.username,
    }, status=201)