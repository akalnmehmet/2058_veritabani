# Bu dosya Alembic'in tüm modelleri görebilmesi için import eder
from app.db.database import Base  # noqa: F401
from app.models.user import *  # noqa: F401, F403
from app.models.catalog import *  # noqa: F401, F403
from app.models.system import *  # noqa: F401, F403
from app.models.customer import *  # noqa: F401, F403
from app.models.project import *  # noqa: F401, F403
from app.models.order import *  # noqa: F401, F403
