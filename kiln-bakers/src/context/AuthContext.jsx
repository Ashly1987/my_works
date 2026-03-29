import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);
const LOCAL_ADMIN_KEY = "kb_local_admin_session";
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "mousemove", "scroll", "touchstart"];
const LOCAL_ADMIN_USER = {
  id: "local-admin",
  email: "admin",
};

function hasLocalAdminSession() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LOCAL_ADMIN_KEY) === "true";
}

async function fetchUserRole(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role === "admin" ? "admin" : "guest";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setRole(null);
    clearInactivityTimer();
  }, [clearInactivityTimer]);

  const performSignOut = useCallback(async ({ silent = false, reason = "manual" } = {}) => {
    window.localStorage.removeItem(LOCAL_ADMIN_KEY);

    const { error } = await supabase.auth.signOut();
    if (error && !silent) throw error;

    clearAuthState();

    if (reason === "timeout") {
      toast("Signed out after 5 minutes of inactivity.");
    }
  }, [clearAuthState]);

  const validateSession = useCallback(async () => {
    if (hasLocalAdminSession()) {
      setUser(LOCAL_ADMIN_USER);
      setRole("admin");
      return true;
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    const currentUser = session?.user ?? null;
    if (!currentUser) {
      clearAuthState();
      return false;
    }

    setUser(currentUser);
    setRole(await fetchUserRole(currentUser.id));
    return true;
  }, [clearAuthState]);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();

    if (!user) return;

    inactivityTimerRef.current = window.setTimeout(() => {
      performSignOut({ silent: true, reason: "timeout" }).catch((error) => {
        console.error(error);
      });
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearInactivityTimer, performSignOut, user]);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        if (hasLocalAdminSession()) {
          if (!isMounted) return;
          setUser(LOCAL_ADMIN_USER);
          setRole("admin");
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        const currentUser = session?.user ?? null;
        if (!isMounted) return;

        setUser(currentUser);

        if (currentUser) {
          const nextRole = await fetchUserRole(currentUser.id);
          if (!isMounted) return;
          setRole(nextRole);
        } else {
          setRole(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error(error);
          setUser(null);
          setRole(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (hasLocalAdminSession() && !session?.user) {
        setUser(LOCAL_ADMIN_USER);
        setRole("admin");
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setRole(null);
        return;
      }

      try {
        const nextRole = await fetchUserRole(currentUser.id);
        setRole(nextRole);
      } catch (error) {
        console.error(error);
        setRole("guest");
      }
    });

    return () => {
      isMounted = false;
      clearInactivityTimer();
      subscription.unsubscribe();
    };
  }, [clearInactivityTimer]);

  useEffect(() => {
    if (!user) {
      clearInactivityTimer();
      return undefined;
    }

    resetInactivityTimer();

    const handleActivity = () => {
      resetInactivityTimer();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      validateSession().catch((error) => {
        console.error(error);
      });
      resetInactivityTimer();
    };

    const handleWindowFocus = () => {
      validateSession().catch((error) => {
        console.error(error);
      });
      resetInactivityTimer();
    };

    const handleStorageChange = () => {
      validateSession().catch((error) => {
        console.error(error);
      });
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("storage", handleStorageChange);
      clearInactivityTimer();
    };
  }, [clearInactivityTimer, resetInactivityTimer, user, validateSession]);

  const signIn = useCallback(async (identifier, password) => {
    if (identifier === "admin" && password === "admin") {
      window.localStorage.setItem(LOCAL_ADMIN_KEY, "true");
      setUser(LOCAL_ADMIN_USER);
      setRole("admin");
      return "admin";
    }

    window.localStorage.removeItem(LOCAL_ADMIN_KEY);

    const { error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });
    if (error) throw error;

    const {
      data: { user: signedInUser },
    } = await supabase.auth.getUser();

    if (!signedInUser) return "guest";

    const nextRole = await fetchUserRole(signedInUser.id);
    setRole(nextRole);
    return nextRole;
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const signedUpUser = data?.user ?? null;
    if (signedUpUser) {
      // Trigger-created profile defaults to guest.
      setRole("guest");
    }

    return "guest";
  }, []);

  const signOut = useCallback(async () => {
    await performSignOut();
  }, [performSignOut]);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: role === "admin",
      signIn,
      signUp,
      signOut,
    }),
    [user, role, loading, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
