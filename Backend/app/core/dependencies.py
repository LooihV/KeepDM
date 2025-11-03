from fastapi import Depends, HTTPException, status
from app.auth.security import oauth2_scheme, decode_access_token
from app.crud.user import get_user_by_username
from app.models.models import UserInDB


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    token_data = decode_access_token(token)
    user = get_user_by_username(token_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return user


async def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user),
) -> UserInDB:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user
