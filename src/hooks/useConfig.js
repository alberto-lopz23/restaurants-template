"use client";
import { useState, useEffect } from "react";
import { getConfig } from "@/lib/db";

export default function useConfig() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const data = await getConfig();
      if (data) setConfig(data);
    };
    cargar();
  }, []);

  return config;
}