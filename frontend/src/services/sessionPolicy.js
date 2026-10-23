// Compare credentials so a late response cannot invalidate a newer sign-in.
export function shouldExpireSession(status, sentAuthorization, currentAuthorization) {
 return status === 401 && Boolean(currentAuthorization) && sentAuthorization === currentAuthorization;
}
