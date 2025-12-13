


from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AlertSubscription

@api_view(["POST"])


def subscribe_alert(request):
    email = request.data.get("email")
    obj, _ = AlertSubscription.objects.get_or_create(email=email)
    obj.enabled = True
    obj.save()
    return Response({"enabled": True})

@api_view(["DELETE"])
def unsubscribe_alert(request):
    email = request.data.get("email")
    AlertSubscription.objects.filter(email=email).update(enabled=False)
    return Response({"enabled": False})
