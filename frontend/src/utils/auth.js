// save JWT token
export function saveToken(token) {
  localStorage.setItem("token", token);
}

// read token
export function getToken() {
  return localStorage.getItem("token");
}

// remove token
export function removeToken() {
  localStorage.removeItem("token");
}
