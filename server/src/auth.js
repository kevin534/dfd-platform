// ============================================================
//  DFD — Authentification (JWT)
// ============================================================
import jwt from "jsonwebtoken";

const SECRET = () => process.env.JWT_SECRET || "dev-secret-change-me";

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    SECRET(),
    { expiresIn: "8h" }
  );
}

// Exige un utilisateur connecté ; option: rôles autorisés
export function requireAuth(roles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Non authentifié" });
    try {
      const payload = jwt.verify(token, SECRET());
      if (roles.length && !roles.includes(payload.role))
        return res.status(403).json({ error: "Accès refusé" });
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: "Session expirée ou invalide" });
    }
  };
}
