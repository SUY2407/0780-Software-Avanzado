from dataclasses import dataclass
from typing import Optional

@dataclass
class EmailDTO:
    from_email: str
    to_email: str
    subject: str
    body: str
    cc: Optional[str] = None