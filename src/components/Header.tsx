import React from "react";
import Link from "next/link";
import DarkModeToggle from "@/components/DarkModeToggle";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/" passHref>
        <h1 className={styles.title}>Secure Chat</h1>
      </Link>
      <DarkModeToggle />
    </header>
  );
};

export default Header;
