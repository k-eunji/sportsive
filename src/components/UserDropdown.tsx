//src/components/UserDropdown.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import UserAvatar from "./UserAvatar";
import { CustomUser } from "@/types/user";

type Props = {
  user: CustomUser;
};

export default function UserDropdown({ user }: Props) {
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth!);
    window.location.href = "/";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2"
      >
        <UserAvatar
          userId={user.uid}
          name={user.authorNickname || user.email || "User"}
          size={32}
          linkToProfile={false}
        />
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2 w-40 
            bg-white dark:bg-gray-900 
            border border-border rounded-lg shadow-lg
            py-2 z-50
          "
        >
          <Link
            href={`/profile/${user.uid}`}
            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="
              block w-full text-left px-4 py-2 
              hover:bg-gray-100 dark:hover:bg-gray-800 
              text-red-600
            "
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
