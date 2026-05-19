from app.routes.auth import router as auth_router
from app.routes.colors import router as colors_router
from app.routes.profiles import router as profiles_router
from app.routes.glasses import router as glasses_router
from app.routes.materials import router as materials_router
from app.routes.remotes import router as remotes_router
from app.routes.customers import router as customers_router
from app.routes.systems import router as systems_router
from app.routes.system_variants import router as system_variants_router
from app.routes.system_templates import router as system_templates_router
from app.routes.projects import router as projects_router
from app.routes.orders import router as orders_router
from app.routes.users import router as users_router

auth = type("_M", (), {"router": auth_router})()
colors = type("_M", (), {"router": colors_router})()
profiles = type("_M", (), {"router": profiles_router})()
glasses = type("_M", (), {"router": glasses_router})()
materials = type("_M", (), {"router": materials_router})()
remotes = type("_M", (), {"router": remotes_router})()
customers = type("_M", (), {"router": customers_router})()
systems = type("_M", (), {"router": systems_router})()
system_variants = type("_M", (), {"router": system_variants_router})()
system_templates = type("_M", (), {"router": system_templates_router})()
projects = type("_M", (), {"router": projects_router})()
orders = type("_M", (), {"router": orders_router})()
users = type("_M", (), {"router": users_router})()

__all__ = [
    "auth", "colors", "profiles", "glasses", "materials", "remotes",
    "customers", "systems", "system_variants", "system_templates",
    "projects", "orders", "users"
]
