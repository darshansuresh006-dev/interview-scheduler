from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from scheduler.auth_views import signup

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('scheduler.urls')),
    path('api/auth/login/', obtain_auth_token),
    path('api/auth/signup/', signup),
]