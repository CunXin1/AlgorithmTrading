from django.utils import timezone
from django.core.mail import send_mail

# ===== 状态定义 =====
STATE_PANIC = "PANIC"              # score < 10
STATE_EXTREME_FEAR = "EXTREME_FEAR"  # 10 <= score < 25
STATE_NORMAL = "NORMAL"            # 25 <= score <= 75
STATE_EXTREME_GREED = "EXTREME_GREED"  # score > 75


def classify(score: float) -> str:
    """
    Convert Fear & Greed score into a market state.
    """
    if score < 10:
        return STATE_PANIC
    elif score < 25:
        return STATE_EXTREME_FEAR
    elif score > 75:
        return STATE_EXTREME_GREED
    else:
        return STATE_NORMAL


def handle_alert(subscription, new_state: str):
    """
    Core alert decision logic.
    Called once per day per subscription.
    """
    now = timezone.now()
    old_state = subscription.last_state

    # ===== 1. 状态切换提醒 =====
    if new_state != old_state:
        _send_state_change_email(subscription.email, old_state, new_state)

        subscription.last_state = new_state

        # 走出 panic 时，清空 panic 计时
        if old_state == STATE_PANIC and new_state != STATE_PANIC:
            subscription.last_panic_sent_at = None

        subscription.save()
        return

    # ===== 2. Panic 持续提醒（每 2 天一次） =====
    if new_state == STATE_PANIC:
        last_sent = subscription.last_panic_sent_at

        if not last_sent or (now - last_sent).days >= 2:
            _send_panic_persist_email(subscription.email)
            subscription.last_panic_sent_at = now
            subscription.save()


# ===== 邮件发送 =====

def _send_state_change_email(email: str, old_state: str, new_state: str):
    send_mail(
        subject=f"Market Alert: {new_state.replace('_', ' ')}",
        message=(
            f"Market sentiment has changed.\n\n"
            f"Previous state: {old_state}\n"
            f"Current state: {new_state}\n\n"
            f"This alert is based on the Fear & Greed Index."
        ),
        from_email=None,  # 使用 DEFAULT_FROM_EMAIL
        recipient_list=[email],
        fail_silently=False,
    )


def _send_panic_persist_email(email: str):
    send_mail(
        subject="Market Alert: Panic Persists",
        message=(
            "The market remains in a PANIC state (Fear & Greed Index < 10).\n\n"
            "This reminder is sent every 2 days while panic conditions persist."
        ),
        from_email=None,
        recipient_list=[email],
        fail_silently=False,
    )
