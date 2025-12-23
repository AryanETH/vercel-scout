import { useState, useEffect } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  inviteCode: string;
  invitedBy?: string;
  inviteCount: number;
  isAuthenticated: boolean;
  favorites: string[];
  likedSites: string[];
  dislikedSites: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const savedUser = localStorage.getItem("yourel_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);

    // Add debug function to window for development
    (window as any).debugYourel = {
      showUsers: () => {
        const users = JSON.parse(localStorage.getItem("yourel_users") || "[]");
        console.table(
          users.map((u: User) => ({
            name: `${u.firstName} ${u.lastName}`,
            code: u.inviteCode,
            inviteCount: u.inviteCount,
            favorites: u.favorites?.length || 0,
            liked: u.likedSites?.length || 0,
          })),
        );
      },
      clearUsers: () => {
        localStorage.removeItem("yourel_users");
        localStorage.removeItem("yourel_user");
        console.log("All users cleared");
      },
    };
  }, []);

  const generateInviteCode = () => {
    // Generate more unique codes using timestamp + random
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    const combined = (timestamp + random).slice(-4);
    return `YOUREL#${combined}`;
  };

  const authenticate = (
    inviteCodeOrUsername: string,
    firstName?: string,
    lastName?: string,
    username?: string,
    password?: string,
  ): boolean => {
    console.log("Authenticating with:", {
      inviteCodeOrUsername,
      firstName,
      lastName,
      username,
      hasPassword: !!password,
    });

    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem("yourel_users") || "[]");
    console.log("Existing users:", existingUsers.length);

    // Check if it's a login attempt (username + password)
    if (!firstName && !lastName && !username && password) {
      // Login with username
      const existingUser = existingUsers.find((u: User) => u.username === inviteCodeOrUsername);
      if (existingUser && existingUser.password === password) {
        localStorage.setItem("yourel_user", JSON.stringify(existingUser));
        setUser(existingUser);
        return true;
      }
      return false;
    }

    // Registration with invite code
    const inviteCode = inviteCodeOrUsername;

    // Check if it's a valid invite code format
    if (!inviteCode.startsWith("YOUREL#") || inviteCode.length !== 11) {
      console.log("Invalid invite code format");
      return false;
    }

    // New user registration - need all details
    if (!firstName || !lastName || !username || !password) {
      return false;
    }

    // Check if username already exists
    if (existingUsers.some((u: User) => u.username === username)) {
      console.log("Username already exists");
      return false;
    }

    // Find inviter if not master code
    let inviter: User | undefined;
    if (inviteCode !== "YOUREL#0001") {
      inviter = existingUsers.find((u: User) => u.inviteCode === inviteCode);

      if (!inviter) {
        console.log("Invite code not found:", inviteCode);
        return false;
      }

      if (inviter.inviteCount >= 5) {
        console.log("Inviter has no remaining invites:", inviter.inviteCount);
        return false; // No more invites left
      }
    }

    // Generate unique invite code and password
    let newInviteCode: string;
    let attempts = 0;
    do {
      newInviteCode = generateInviteCode();
      attempts++;
    } while (existingUsers.some((u: User) => u.inviteCode === newInviteCode) && attempts < 100);

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      firstName,
      lastName,
      username: username!,
      password,
      inviteCode: newInviteCode,
      invitedBy: inviter?.id,
      inviteCount: 0,
      isAuthenticated: true,
      favorites: [],
      likedSites: [],
      dislikedSites: [],
    };

    // Update inviter's count and save users
    if (inviteCode === "YOUREL#0001") {
      // First user with master code
      localStorage.setItem("yourel_users", JSON.stringify([newUser]));
    } else if (inviter) {
      // Update inviter's count
      inviter.inviteCount += 1;
      const updatedUsers = existingUsers.map((u: User) => (u.id === inviter.id ? inviter : u));
      updatedUsers.push(newUser);
      localStorage.setItem("yourel_users", JSON.stringify(updatedUsers));
    }

    // Save current user
    localStorage.setItem("yourel_user", JSON.stringify(newUser));
    setUser(newUser);
    console.log("User created successfully:", newUser);
    return true;
  };

  const debugInviteCodes = () => {
    const users = JSON.parse(localStorage.getItem("yourel_users") || "[]");
    console.log(
      "All invite codes:",
      users.map((u: User) => ({
        name: `${u.firstName} ${u.lastName}`,
        code: u.inviteCode,
        inviteCount: u.inviteCount,
      })),
    );
  };

  const generatePassword = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const likeSite = (url: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      likedSites: [...user.likedSites.filter((site) => site !== url), url],
      dislikedSites: user.dislikedSites.filter((site) => site !== url),
    };

    setUser(updatedUser);
    localStorage.setItem("yourel_user", JSON.stringify(updatedUser));

    // Update in users array
    const existingUsers = JSON.parse(localStorage.getItem("yourel_users") || "[]");
    const updatedUsers = existingUsers.map((u: User) => (u.id === user.id ? updatedUser : u));
    localStorage.setItem("yourel_users", JSON.stringify(updatedUsers));
  };

  const dislikeSite = (url: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      dislikedSites: [...user.dislikedSites.filter((site) => site !== url), url],
      likedSites: user.likedSites.filter((site) => site !== url),
    };

    setUser(updatedUser);
    localStorage.setItem("yourel_user", JSON.stringify(updatedUser));

    // Update in users array
    const existingUsers = JSON.parse(localStorage.getItem("yourel_users") || "[]");
    const updatedUsers = existingUsers.map((u: User) => (u.id === user.id ? updatedUser : u));
    localStorage.setItem("yourel_users", JSON.stringify(updatedUsers));
  };

  const addToFavorites = (url: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      favorites: [...user.favorites.filter((site) => site !== url), url],
    };

    setUser(updatedUser);
    localStorage.setItem("yourel_user", JSON.stringify(updatedUser));

    // Update in users array
    const existingUsers = JSON.parse(localStorage.getItem("yourel_users") || "[]");
    const updatedUsers = existingUsers.map((u: User) => (u.id === user.id ? updatedUser : u));
    localStorage.setItem("yourel_users", JSON.stringify(updatedUsers));
  };

  const removeFromFavorites = (url: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      favorites: user.favorites.filter((site) => site !== url),
    };

    setUser(updatedUser);
    localStorage.setItem("yourel_user", JSON.stringify(updatedUser));

    // Update in users array
    const existingUsers = JSON.parse(localStorage.getItem("yourel_users") || "[]");
    const updatedUsers = existingUsers.map((u: User) => (u.id === user.id ? updatedUser : u));
    localStorage.setItem("yourel_users", JSON.stringify(updatedUsers));
  };

  const logout = () => {
    localStorage.removeItem("yourel_user");
    setUser(null);
  };

  const getInviteText = () => {
    if (!user) return "";
    const websiteUrl = window.location.origin;
    return `oyy ye dekh kya faadu chiz he be ${websiteUrl} - Invite code: ${user.inviteCode}`;
  };

  return {
    user,
    isLoading,
    authenticate,
    logout,
    getInviteText,
    generatePassword,
    likeSite,
    dislikeSite,
    addToFavorites,
    removeFromFavorites,
    debugInviteCodes,
    isAuthenticated: !!user?.isAuthenticated,
  };
}
