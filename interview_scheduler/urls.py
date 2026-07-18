from django.contrib import admin
from django.urls import path, include
from scheduler.auth_views import signup, login_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('scheduler.urls')),
    path('api/auth/login/', login_view),
    path('api/auth/signup/', signup),
]