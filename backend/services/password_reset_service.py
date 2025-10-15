from typing import Optional, Tuple
from datetime import datetime, timedelta

from repositories.password_reset_repository import PasswordResetRepository
from repositories.user_repository import UserRepository
from services.email_service import EmailService
from services.user_service import UserService


class PasswordResetService:
    """Servicio para gestionar la recuperación de contraseñas"""

    @staticmethod
    def request_password_reset(email: str) -> Tuple[bool, Optional[str]]:
        """Solicita un código de recuperación y lo envía por email (si aplica)."""
        try:
            if not email or not email.strip():
                return False, "El email es obligatorio"

            user = UserRepository.find_by_email(email.lower().strip())

            # Por seguridad, no revelar si el email existe; devolver éxito simulando envío
            if not user:
                return True, None

            # Invalidar tokens anteriores
            PasswordResetRepository.invalidate_old_tokens(user.id)

            token = PasswordResetRepository.create_reset_token(user.id)
            if not token:
                return False, "Error al generar código de recuperación"

            sent = EmailService.send_password_reset_code(
                email=user.email,
                code=token,
                user_name=user.name or user.email,
            )

            if not sent:
                return False, "Error al enviar el email"

            return True, None

        except Exception as e:
            print(f"❌ Error en request_password_reset: {e}")
            return False, "Error interno del servidor"

    @staticmethod
    def verify_reset_code(email: str, code: str) -> Tuple[bool, Optional[str]]:
        try:
            if not email or not code:
                return False, "Email y código son obligatorios"

            if len(code.strip()) != 6:
                return False, "El código debe tener 6 dígitos"

            user_id = PasswordResetRepository.verify_token(email.lower().strip(), code.strip())
            if not user_id:
                return False, "Código inválido o expirado"

            return True, None

        except Exception as e:
            print(f"❌ Error en verify_reset_code: {e}")
            return False, "Error interno del servidor"

    @staticmethod
    def reset_password(email: str, code: str, new_password: str) -> Tuple[bool, Optional[str]]:
        try:
            if not email or not code or not new_password:
                return False, "Todos los campos son obligatorios"

            if len(new_password) < 6:
                return False, "La contraseña debe tener al menos 6 caracteres"

            user_id = PasswordResetRepository.verify_token(email.lower().strip(), code.strip())
            if not user_id:
                return False, "Código inválido o expirado"

            user = UserRepository.find_by_id(user_id)
            if not user:
                return False, "Usuario no encontrado"

            password_hash = UserService.hash_password(new_password)

            # Actualizar contraseña
            query = """
                UPDATE users
                SET password_hash = %s, updated_at = NOW()
                WHERE id = %s
            """
            from database.connection import Database

            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (password_hash, user_id))
                if cursor.rowcount == 0:
                    return False, "Error al actualizar la contraseña"

            # Marcar token como usado
            PasswordResetRepository.mark_token_as_used(user_id, code.strip())

            # Notificar cambio
            EmailService.send_password_changed_notification(email=user.email, user_name=user.name or user.email)

            return True, None

        except Exception as e:
            print(f"❌ Error en reset_password: {e}")
            return False, "Error interno del servidor"

    @staticmethod
    def resend_code(email: str) -> Tuple[bool, Optional[str]]:
        try:
            if not email or not email.strip():
                return False, "El email es obligatorio"

            user = UserRepository.find_by_email(email.lower().strip())
            if not user:
                return True, None

            active = PasswordResetRepository.get_active_token(user.id)
            if active:
                created_at = active.get('created_at') or active.get('createdat')
                if created_at and (datetime.now() - created_at) < timedelta(minutes=2):
                    EmailService.send_password_reset_code(email=user.email, code=active['token'], user_name=user.name or user.email)
                    return True, None

            return PasswordResetService.request_password_reset(email)

        except Exception as e:
            print(f"❌ Error en resend_code: {e}")
            return False, "Error interno del servidor"
