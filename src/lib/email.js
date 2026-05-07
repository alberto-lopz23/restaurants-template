export const enviarEmail = async (tipo, reservacion) => {
  try {
    const res = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, reservacion }),
    });
    return await res.json();
  } catch (err) {
    console.error("Error enviando email:", err);
  }
};