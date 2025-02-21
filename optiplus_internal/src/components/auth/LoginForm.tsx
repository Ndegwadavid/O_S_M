"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./LoginForm.module.css";

interface LoginFormProps {
  userType: "staff" | "admin";
}

export default function LoginForm({ userType }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
        return;
      }

      if (userType === "admin") {
        router.push("/admin");
      } else {
        router.push("/reception");
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <div className={styles.formWrapper}>
        <Image
          src="/logo.png"
          alt="OptiPlus Logo"
          width={130}
          height={130}
          className={styles.logo}
        />
        <div>
          <h1 className={styles.title}>OptiPlus Management</h1>
          <h2 className={styles.subtitle}>
            {userType === "admin" ? "Admin Login" : "Staff Login"}
          </h2>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Staff
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Enter name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.button}
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}