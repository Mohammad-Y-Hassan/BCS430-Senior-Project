import React from "react";

const AuthCardWrapper = ({ title, children }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.formWrapper}>
          {title && <h2 style={styles.title}>{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "20px",
  },
  card: {
    backgroundColor: "rgba(0, 73, 64, 0.85)",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
    width: "500px",
    color: "white",
    textAlign: "center",
  },
  formWrapper: {
    maxWidth: "330px",
    margin: "0 auto",
  },
  title: {
    marginBottom: "16px",
    fontSize: "1.8rem",
    fontWeight: "700",
  },
};

export default AuthCardWrapper;
