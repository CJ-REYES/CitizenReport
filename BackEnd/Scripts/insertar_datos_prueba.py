import random
import datetime
from faker import Faker
import pymysql
import bcrypt

# CONFIGURACIÓN DE BASE DE DATOS
DB_HOST = 'localhost'
DB_USER = 'root'          # Cambia por tu usuario
DB_PASSWORD = ''          # Cambia por tu contraseña
DB_NAME = 'reportesdb'

NUM_USERS = 100
NUM_REPORTS = 300
NUM_VALIDATIONS_TARGET = 500   # aproximado, se generarán cerca de este número
NUM_MINI_GAMES = 200

fake = Faker('es_MX')

def random_date(start, end):
    return start + datetime.timedelta(
        seconds=random.randint(0, int((end - start).total_seconds()))
    )

def random_lat_lon_candelaria():
    """
    Coordenadas centradas en la ciudad de Candelaria, Campeche.
    Centro: lat 18.186356, lon -91.041947
    Rango: ±0.02° en latitud y longitud (aproximadamente 2 km).
    """
    center_lat = 18.186356
    center_lon = -91.041947
    delta = 0.02
    lat = center_lat + random.uniform(-delta, delta)
    lon = center_lon + random.uniform(-delta, delta)
    return lat, lon

def hash_password_bcrypt(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# CONEXIÓN
conn = pymysql.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)
cursor = conn.cursor()

# LIMPIAR DATOS
print("🔄 Limpiando datos existentes...")
cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
cursor.execute("TRUNCATE TABLE minigamematches")
cursor.execute("TRUNCATE TABLE reportevalidaciones")
cursor.execute("TRUNCATE TABLE reportes")
cursor.execute("TRUNCATE TABLE users")
cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
conn.commit()
print("✅ Tablas limpiadas.")

# USUARIOS
print("Generando usuarios...")
user_ids = []
sql_users = """
INSERT INTO users (Id, Nombre, Email, PasswordHash, Rol, FotoPerfilURL, Puntos, Rango, Monedas, UltimaRecargaVidas, Vidas)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""
for i in range(1, NUM_USERS + 1):
    nombre = fake.name()
    email = fake.email()
    password_hash = hash_password_bcrypt("password123")
    rol = random.choice(['Usuario', 'Admin', 'Inspector'])
    foto_perfil = fake.image_url() if random.random() > 0.5 else ''
    puntos = random.randint(0, 5000)
    rango = random.choice(['Ciudadano Novato', 'Colaborador', 'Supervisor', 'Guardian'])
    monedas = random.randint(0, 500)
    ultima_recarga = random_date(datetime.datetime(2024, 1, 1), datetime.datetime.now())
    vidas = random.randint(3, 10)
    cursor.execute(sql_users, (i, nombre, email, password_hash, rol, foto_perfil, puntos, rango, monedas, ultima_recarga.date(), vidas))
    user_ids.append(i)
conn.commit()
print(f"✅ {NUM_USERS} usuarios insertados.")

# REPORTES (estado inicial = "EnValidacion")
print("Generando reportes...")
report_ids = []
tipos_incidente = ['Bache', 'Alumbrado', 'Basura', 'Semaforo', 'Fuga de agua', 'Vandalismo', 'Accidente vial', 'Árbol caído']
estado_inicial = "EnValidacion"
sql_reports = """
INSERT INTO reportes (Id, CiudadanoId, TipoIncidente, DescripcionDetallada, Latitud, Longitud, UrlFoto, Estado, FechaCreacion, Colonia)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""
for i in range(1, NUM_REPORTS + 1):
    ciudadano_id = random.choice(user_ids)
    tipo = random.choice(tipos_incidente)
    descripcion = fake.sentence(nb_words=20)
    lat, lon = random_lat_lon_candelaria()
    url_foto = fake.image_url() if random.random() > 0.3 else ''
    fecha_creacion = random_date(datetime.datetime(2024, 1, 1), datetime.datetime.now())
    colonia = fake.street_name()
    cursor.execute(sql_reports, (i, ciudadano_id, tipo, descripcion, lat, lon, url_foto, estado_inicial, fecha_creacion, colonia))
    report_ids.append(i)
conn.commit()
print(f"✅ {NUM_REPORTS} reportes insertados.")

# VALIDACIONES (evitar duplicados por reporte+usuario)
print("Generando validaciones...")
sql_validations = """
INSERT INTO reportevalidaciones (Id, ReporteId, CiudadanoId, EsPositiva, FechaValidacion)
VALUES (%s, %s, %s, %s, %s)
"""

total_validaciones = 0
validacion_id = 1
for reporte_id in report_ids:
    # Obtener el creador del reporte para no permitir que valide su propio reporte
    cursor.execute("SELECT CiudadanoId FROM reportes WHERE Id = %s", (reporte_id,))
    creador = cursor.fetchone()
    if not creador:
        continue
    creador_id = creador['CiudadanoId']
    posibles_validadores = [uid for uid in user_ids if uid != creador_id]
    if not posibles_validadores:
        continue

    # Número de validaciones para este reporte (0-15, pero ajustamos al total deseado)
    num_validaciones_reporte = random.randint(0, 15)
    if total_validaciones + num_validaciones_reporte > NUM_VALIDATIONS_TARGET:
        num_validaciones_reporte = NUM_VALIDATIONS_TARGET - total_validaciones
        if num_validaciones_reporte <= 0:
            break

    # Seleccionar validadores únicos
    validadores = random.sample(posibles_validadores, min(num_validaciones_reporte, len(posibles_validadores)))
    for validador_id in validadores:
        es_positiva = random.choice([True, False])
        fecha_validacion = random_date(datetime.datetime(2024, 1, 1), datetime.datetime.now())
        try:
            cursor.execute(sql_validations, (validacion_id, reporte_id, validador_id, 1 if es_positiva else 0, fecha_validacion))
            validacion_id += 1
            total_validaciones += 1
        except pymysql.err.IntegrityError:
            # Si por alguna razón hay duplicado (no debería), ignorar
            pass
    if validacion_id % 100 == 0:
        conn.commit()

conn.commit()
print(f"✅ {total_validaciones} validaciones insertadas.")

# MINIJUEGOS
print("Generando partidas de minijuego...")
sql_minigames = """
INSERT INTO minigamematches (Id, UserId, Score, PlayedAt)
VALUES (%s, %s, %s, %s)
"""
for i in range(1, NUM_MINI_GAMES + 1):
    user_id = random.choice(user_ids)
    score = random.randint(0, 10000)
    played_at = random_date(datetime.datetime(2024, 1, 1), datetime.datetime.now())
    cursor.execute(sql_minigames, (i, user_id, score, played_at))
conn.commit()
print(f"✅ {NUM_MINI_GAMES} partidas insertadas.")

cursor.close()
conn.close()
print("\n🎉 Todos los datos han sido insertados correctamente en la base de datos.")