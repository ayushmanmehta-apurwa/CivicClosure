"""Time helpers.

Real timestamps (tickets, events, photos) always use real UTC time.
The *demo clock* only shifts the moment SLA deadlines are evaluated, per workspace, so a demo can
show an escalation without waiting days. Escalations caused by it are flagged simulated=True and are
excluded from any real service-performance figure.
"""
from datetime import datetime, timedelta, timezone

from .models import Setting


def real_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _key(workspace: str) -> str:
    return 'clock_offset_hours:' + workspace


def get_offset_hours(db, workspace: str) -> float:
    row = db.get(Setting, _key(workspace))
    return float(row.value) if row else 0.0


def set_offset_hours(db, workspace: str, hours: float) -> None:
    row = db.get(Setting, _key(workspace))
    if row:
        row.value = str(hours)
    else:
        db.add(Setting(key=_key(workspace), value=str(hours)))
    db.flush()


def sla_now(db, workspace: str) -> datetime:
    return real_now() + timedelta(hours=get_offset_hours(db, workspace))
