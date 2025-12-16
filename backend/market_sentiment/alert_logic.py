from django.utils import timezone
from datetime import timedelta

# ===== 状态定义 =====
STATE_PANIC = "PANIC"
STATE_EXTREME_FEAR = "EXTREME_FEAR"
STATE_NORMAL = "NORMAL"
STATE_EXTREME_GREED = "EXTREME_GREED"


def classify(score: float) -> str:
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
    Pure state transition logic.
    ❌ No email sending here.
    Returns a list of events.
    """

    now = timezone.now()
    events = []

    old_state = subscription.last_state

    # ===== 1. 状态切换 =====
    if new_state != old_state:
        events.append({
            "type": "STATE_CHANGE",
            "from": old_state,
            "to": new_state,
        })

        subscription.last_state = new_state

        # 走出 panic，清空计时
        if old_state == STATE_PANIC and new_state != STATE_PANIC:
            subscription.last_panic_sent_at = None

        subscription.save()
        return events

    # ===== 2. Panic 持续提醒（每 2 天一次）=====
    if new_state == STATE_PANIC:
        last_sent = subscription.last_panic_sent_at

        if not last_sent or (now - last_sent) >= timedelta(days=2):
            events.append({
                "type": "PANIC_PERSIST",
            })
            subscription.last_panic_sent_at = now
            subscription.save()

    return events
