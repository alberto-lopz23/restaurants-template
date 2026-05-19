import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPsBu_WJ5c2dTBOt_CKEX3L_zZxh3ERMc",
  authDomain: "restaurants-template-1eb41.firebaseapp.com",
  projectId: "restaurants-template-1eb41",
  storageBucket: "restaurants-template-1eb41.firebasestorage.app",
  messagingSenderId: "814401210123",
  appId: "1:814401210123:web:f02e9ebd3124b2c87f040e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const RESTAURANT_ID = "restaurante-1";

const menu = [
  // ENTRADAS
  {
    nombre: "Tostones con Salami",
    precio: 220,
    descripcion:
      "Tostones crujientes acompañados de salami frito y salsa de ajo.",
    categoria: "Entradas",
    disponible: true,
    destacado: true,
    pedidos: 0,
  },
  {
    nombre: "Yuca Frita con Mojo",
    precio: 180,
    descripcion: "Yuca frita dorada bañada en mojo de ajo y limón.",
    categoria: "Entradas",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Chicharrón de Cerdo",
    precio: 280,
    descripcion: "Chicharrón crujiente de cerdo servido con tostones y limón.",
    categoria: "Entradas",
    disponible: true,
    destacado: true,
    pedidos: 0,
  },
  {
    nombre: "Ceviche de Camarones",
    precio: 320,
    descripcion:
      "Camarones frescos marinados en limón con cebolla, cilantro y ají.",
    categoria: "Entradas",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Ensalada Verde",
    precio: 160,
    descripcion:
      "Mix de lechugas, tomate, pepino y zanahoria con aderezo de la casa.",
    categoria: "Entradas",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Sopa de Pollo Criolla",
    precio: 200,
    descripcion: "Sopa de pollo con vegetales frescos y sazón dominicano.",
    categoria: "Entradas",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },

  // PLATOS PRINCIPALES
  {
    nombre: "La Bandera Dominicana",
    precio: 380,
    descripcion:
      "Arroz blanco, habichuelas rojas, carne guisada y ensalada verde. El plato más emblemático de nuestra cocina.",
    categoria: "Platos Principales",
    disponible: true,
    destacado: true,
    pedidos: 0,
  },
  {
    nombre: "Sancocho de Siete Carnes",
    precio: 520,
    descripcion:
      "El legendario sancocho dominicano con siete tipos de carne, yuca, ñame, plátano y especias criollas.",
    categoria: "Platos Principales",
    disponible: true,
    destacado: true,
    pedidos: 0,
  },
  {
    nombre: "Pollo Guisado con Arroz",
    precio: 350,
    descripcion:
      "Pollo guisado al estilo dominicano con arroz blanco y habichuelas.",
    categoria: "Platos Principales",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Chivo Guisado",
    precio: 480,
    descripcion:
      "Chivo guisado lentamente con vino tinto, especias y vegetales. Servido con arroz y tostones.",
    categoria: "Platos Principales",
    disponible: true,
    destacado: true,
    pedidos: 0,
  },
  {
    nombre: "Pescado Frito Entero",
    precio: 550,
    descripcion:
      "Pescado fresco frito entero, servido con arroz, tostones y ensalada.",
    categoria: "Platos Principales",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Mofongo de Camarones",
    precio: 490,
    descripcion:
      "Mofongo de plátano verde relleno de camarones al ajillo en salsa criolla.",
    categoria: "Platos Principales",
    disponible: true,
    destacado: true,
    pedidos: 0,
  },
  {
    nombre: "Mangú con Los Tres Golpes",
    precio: 280,
    descripcion:
      "Mangú de plátano con salami frito, huevo frito y queso blanco frito.",
    categoria: "Platos Principales",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Res Guisada con Papas",
    precio: 420,
    descripcion:
      "Carne de res guisada con papas, zanahoria y especias criollas.",
    categoria: "Platos Principales",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Asopao de Pollo",
    precio: 360,
    descripcion:
      "Arroz caldoso con pollo, vegetales frescos y sazón de la casa.",
    categoria: "Platos Principales",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },

  // BEBIDAS
  {
    nombre: "Jugo de Chinola",
    precio: 120,
    descripcion: "Jugo natural de maracuyá fresco, con o sin azúcar.",
    categoria: "Bebidas",
    disponible: true,
    destacado: true,
    pedidos: 0,
  },
  {
    nombre: "Morir Soñando",
    precio: 130,
    descripcion:
      "Bebida clásica dominicana de jugo de naranja con leche evaporada.",
    categoria: "Bebidas",
    disponible: true,
    destacado: true,
    pedidos: 0,
  },
  {
    nombre: "Jugo de Lechosa",
    precio: 120,
    descripcion: "Jugo natural de papaya fresca batida con leche.",
    categoria: "Bebidas",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Mamajuana",
    precio: 180,
    descripcion:
      "La bebida tradicional dominicana macerada con ron, vino y miel.",
    categoria: "Bebidas",
    disponible: true,
    destacado: true,
    pedidos: 0,
  },
  {
    nombre: "Presidente Fría",
    precio: 150,
    descripcion: "Cerveza dominicana Presidente bien fría.",
    categoria: "Bebidas",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Agua de Coco Natural",
    precio: 100,
    descripcion: "Agua de coco natural servida directamente del coco.",
    categoria: "Bebidas",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Refresco de la Casa",
    precio: 90,
    descripcion:
      "Refresco frío de tamarindo, jamaica o jengibre. Pregunte por el del día.",
    categoria: "Bebidas",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Café Dominicano",
    precio: 80,
    descripcion: "Café negro fuerte estilo dominicano.",
    categoria: "Bebidas",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },

  // POSTRES
  {
    nombre: "Flan de Coco",
    precio: 160,
    descripcion: "Flan cremoso de coco con caramelo artesanal.",
    categoria: "Postres",
    disponible: true,
    destacado: true,
    pedidos: 0,
  },
  {
    nombre: "Habichuelas con Dulce",
    precio: 140,
    descripcion:
      "Postre tradicional dominicano de habichuelas rojas con leche, coco y especias.",
    categoria: "Postres",
    disponible: true,
    destacado: true,
    pedidos: 0,
  },
  {
    nombre: "Arroz con Leche",
    precio: 120,
    descripcion: "Arroz cremoso cocinado con leche, canela y vainilla.",
    categoria: "Postres",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Tres Leches",
    precio: 180,
    descripcion:
      "Bizcocho esponjoso empapado en tres tipos de leche con crema chantilly.",
    categoria: "Postres",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Majarete",
    precio: 130,
    descripcion: "Postre dominicano de maíz tierno con coco, canela y azúcar.",
    categoria: "Postres",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
  {
    nombre: "Helado de Vainilla con Maní",
    precio: 110,
    descripcion: "Bola de helado de vainilla con maní tostado y miel.",
    categoria: "Postres",
    disponible: true,
    destacado: false,
    pedidos: 0,
  },
];

async function subirMenu() {
  console.log(`Subiendo ${menu.length} platos...`);
  const ref = collection(db, "restaurants", RESTAURANT_ID, "menu");

  for (const plato of menu) {
    await addDoc(ref, plato);
    console.log(`✓ ${plato.nombre}`);
  }

  console.log("\n¡Menú subido completo!");
  process.exit(0);
}

subirMenu().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
