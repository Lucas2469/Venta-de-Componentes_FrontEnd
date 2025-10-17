import { User, Product, MeetingPoint, CreditPackage, Category, Rating } from "./types";
// cambios
// USUARIOS MOCK MAPEADOS A LA BASE DE DATOS REAL
export const mockUsers: User[] = [
  {
    // ADMIN REAL DE LA BD (ID: 1)
    id: "1",
    username: "Admin",
    email: "admin@electromarket.bo",
    role: "admin",
    registrationDate: "2025-09-21",
    rating: 0.0,
    totalTransactions: 0,
    credits: 0,
    creditos_disponibles: 0,
    isSeller: false,
    isBuyer: false
  },
  {
    // JUAN CARLOS PÉREZ MAMANI (ID: 2) - VENDEDOR CON 50 CRÉDITOS
    id: "2",
    username: "juan_tech",
    email: "juan.perez@email.com",
    role: "user",
    registrationDate: "2025-09-21",
    rating: 0.0,
    totalTransactions: 0,
    credits: 50,
    creditos_disponibles: 50,
    isSeller: true,
    isBuyer: true
  },
  {
    // MARÍA ELENA LÓPEZ VARGAS (ID: 3) - COMPRADOR CON 10 CRÉDITOS (ACTUALIZADO)
    id: "3",
    username: "maria_buyer",
    email: "maria.lopez@email.com",
    role: "user",
    registrationDate: "2025-09-21",
    rating: 5.0,
    totalTransactions: 0,
    credits: 10,
    creditos_disponibles: 10,
    isSeller: true,  // ← Ahora puede vender porque tiene créditos
    isBuyer: true
  },
  {
    // CARLOS ALBERTO QUISPE CONDORI (ID: 4) - VENDEDOR CON 53 CRÉDITOS
    id: "4",
    username: "carlos_seller",
    email: "carlos.quispe@email.com",
    role: "user",
    registrationDate: "2025-09-21",
    rating: 5.0,
    totalTransactions: 0,
    credits: 53,
    creditos_disponibles: 53,
    isSeller: true,
    isBuyer: true  // ← Corregido: también puede comprar
  }
];

export const mockProducts: Product[] = [
  {
    id: "1",
    title: "Arduino UNO R3 Original",
    description: "Microcontrolador Arduino UNO R3 original, perfecto para proyectos de electrónica. Incluye cable USB y documentación completa.",
    price: 25,
    category: "microcontroladores",
    images: ["https://images.unsplash.com/photo-1518083165180-3fb016163e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmR1aW5vJTIwZWxlY3Ryb25pY3MlMjBjaXJjdWl0fGVufDF8fHx8MTc1NzA0NTEwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    sellerId: "1",
    sellerName: "juan_tech",
    sellerRating: 4.8,
    meetingPoints: ["1", "2"],
    availableDates: ["2024-12-20", "2024-12-21", "2024-12-22"],
    weeklySchedule: {
      lunes: ["09:00", "14:00", "18:00"],
      martes: ["10:00", "15:00"],
      miercoles: [],
      jueves: ["09:00", "16:00"],
      viernes: ["14:00", "17:00"],
      sabado: ["10:00", "15:00"],
      domingo: []
    },
    status: "active",
    createdAt: "2024-12-10",
    views: 45
  },
  {
    id: "2", 
    title: "Sensor DHT22 Temperatura y Humedad",
    description: "Sensor digital de temperatura y humedad DHT22, alta precisión. Ideal para proyectos IoT y monitoreo ambiental.",
    price: 8,
    category: "sensores",
    images: ["https://images.unsplash.com/photo-1581092918484-8313018e23e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwc2Vuc29yJTIwY2lyY3VpdHxlbnwxfHx8fDE3NTcwNDUxMDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    sellerId: "1",
    sellerName: "juan_tech", 
    sellerRating: 4.8,
    meetingPoints: ["1", "3"],
    availableDates: ["2024-12-23", "2024-12-24"],
    weeklySchedule: {
      lunes: ["11:00", "16:00"],
      martes: [],
      miercoles: ["09:30", "14:30"],
      jueves: ["10:00", "15:00"],
      viernes: [],
      sabado: ["09:00", "13:00"],
      domingo: ["10:00"]
    },
    status: "active",
    createdAt: "2024-12-08",
    views: 67
  },
  {
    id: "3",
    title: "Servo Motor SG90 9g",
    description: "Micro servo motor SG90 de 9g, 180° de rotación. Perfecto para proyectos de robótica y automatización.",
    price: 5,
    category: "actuadores",
    images: ["https://images.unsplash.com/photo-1573164713619-24c711fe7878?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdGljcyUyMG1vdG9yJTIwZWxlY3Ryb25pY3N8ZW58MXx8fHwxNzU3MDQ1MTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    sellerId: "4",
    sellerName: "tech_seller",
    sellerRating: 4.6,
    meetingPoints: ["2", "3"],
    availableDates: ["2024-12-20", "2024-12-22"],
    weeklySchedule: {
      lunes: ["08:00", "13:00"],
      martes: ["10:00", "15:00", "19:00"],
      miercoles: ["09:00"],
      jueves: [],
      viernes: ["14:00", "18:00"],
      sabado: ["11:00", "16:00"],
      domingo: ["09:00", "14:00"]
    },
    status: "active", 
    createdAt: "2024-12-12",
    views: 23
  },
  {
    id: "4",
    title: "ESP32 DevKit V1",
    description: "Placa de desarrollo ESP32 con WiFi y Bluetooth integrados. Ideal para proyectos IoT avanzados.",
    price: 15,
    category: "microcontroladores",
    images: ["https://images.unsplash.com/photo-1581094288338-2314dddb7ece?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3AzMiUyMG1pY3JvY29udHJvbGxlciUyMGVsZWN0cm9uaWNzfGVufDF8fHx8MTc1NzA0NTEwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    sellerId: "1",
    sellerName: "juan_tech",
    sellerRating: 4.8,
    meetingPoints: ["1", "2"],
    availableDates: ["2024-12-21", "2024-12-23"],
    weeklySchedule: {
      lunes: ["09:00", "14:00", "18:00"],
      martes: ["10:00", "15:00"],
      miercoles: [],
      jueves: ["09:00", "16:00"],
      viernes: ["14:00", "17:00"],
      sabado: ["10:00", "15:00"],
      domingo: []
    },
    status: "active",
    createdAt: "2024-12-11", 
    views: 34
  },
  {
    id: "5",
    title: "Kit Resistencias 1/4W (600 piezas)",
    description: "Kit completo de resistencias de 1/4W, valores desde 1Ω hasta 10MΩ. Organizado en caja plástica.",
    price: 12,
    category: "componentes-pasivos",
    images: ["https://images.unsplash.com/photo-1581092918484-8313018e23e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwcmVzaXN0b3JzJTIwY29tcG9uZW50c3xlbnwxfHx8fDE3NTcwNDUxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    sellerId: "4",
    sellerName: "tech_seller", 
    sellerRating: 4.6,
    meetingPoints: ["2", "3"],
    availableDates: ["2024-12-19", "2024-12-20"],
    weeklySchedule: {
      lunes: ["08:00", "13:00"],
      martes: ["10:00", "15:00", "19:00"],
      miercoles: ["09:00"],
      jueves: [],
      viernes: ["14:00", "18:00"],
      sabado: ["11:00", "16:00"],
      domingo: ["09:00", "14:00"]
    },
    status: "active",
    createdAt: "2024-12-09",
    views: 56
  },
  {
    id: "6",
    title: "Protoboard 830 puntos",
    description: "Protoboard de 830 puntos sin soldadura, ideal para prototipos. Incluye cables jumper macho-macho.",
    price: 7,
    category: "herramientas",
    images: ["https://images.unsplash.com/photo-1518083165180-3fb016163e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90b2JvYXJkJTIwZWxlY3Ryb25pY3MlMjBjaXJjdWl0fGVufDF8fHx8MTc1NzA0NTExNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    sellerId: "1",
    sellerName: "juan_tech",
    sellerRating: 4.8,
    meetingPoints: ["1"],
    availableDates: ["2024-12-20"],
    weeklySchedule: {
      lunes: ["09:00", "14:00", "18:00"],
      martes: ["10:00", "15:00"],
      miercoles: [],
      jueves: ["09:00", "16:00"],
      viernes: ["14:00", "17:00"],
      sabado: ["10:00", "15:00"],
      domingo: []
    },
    status: "pending",
    createdAt: "2024-12-15",
    views: 12
  }
];

export const mockMeetingPoints: MeetingPoint[] = [
  {
    id: "1",
    nombre: "Plaza San Francisco",
    direccion: "Plaza San Francisco, La Paz, Bolivia",
    referencias: "Centro",
    coordenadas_lat: -16.4955,
    coordenadas_lng: -68.1336,
    estado: "activo",
    fecha_creacion: "2024-01-01"
  },
  {
    id: "2", 
    nombre: "Centro Comercial Megacenter",
    direccion: "Av. Rafael Pabón, La Paz, Bolivia",
    referencias: "Zona Sur",
    coordenadas_lat: -16.5,
    coordenadas_lng: -68.1193,
    estado: "activo",
    fecha_creacion: "2024-01-02"
  },
  {
    id: "3",
    nombre: "Universidad Mayor de San Andrés",
    direccion: "Av. Villazón 1995, La Paz, Bolivia", 
    referencias: "Centro",
    coordenadas_lat: -16.5402,
    coordenadas_lng: -68.0731,
    estado: "activo",
    fecha_creacion: "2024-01-03"
  },
  {
    id: "4",
    nombre: "Plaza Abaroa",
    direccion: "Plaza Abaroa, La Paz, Bolivia",
    referencias: "Zona Norte",
    coordenadas_lat: -16.489,
    coordenadas_lng: -68.145,
    estado: "activo",
    fecha_creacion: "2024-01-04"
  },
  {
    id: "5",
    nombre: "Mercado Rodríguez",
    direccion: "Mercado Rodríguez, La Paz, Bolivia",
    referencias: "Centro",
    coordenadas_lat: -16.498,
    coordenadas_lng: -68.138,
    estado: "activo",
    fecha_creacion: "2024-01-05"
  },
  {
    id: "6",
    nombre: "Plaza del Estudiante",
    direccion: "Av. 6 de Agosto, La Paz, Bolivia",
    referencias: "Zona Este",
    coordenadas_lat: -16.5200,
    coordenadas_lng: -68.1000,
    estado: "activo",
    fecha_creacion: "2024-01-06"
  },
  {
    id: "7",
    nombre: "Mall Ventura",
    direccion: "Av. Costanera, La Paz, Bolivia",
    referencias: "Zona Oeste",
    coordenadas_lat: -16.4800,
    coordenadas_lng: -68.1200,
    estado: "inactivo",
    fecha_creacion: "2024-01-07"
  },
  {
    id: "8",
    nombre: "Plaza España",
    direccion: "Av. Mariscal Santa Cruz, La Paz, Bolivia",
    referencias: "Zona Sur",
    coordenadas_lat: -16.5100,
    coordenadas_lng: -68.1100,
    estado: "activo",
    fecha_creacion: "2024-01-08"
  }
];

export const mockCreditPackages: CreditPackage[] = [
  {
    id: "1",
    name: "Paquete Básico",
    credits: 5,
    price: 50,
    qrCodeUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Commons_QR_code.png"
  },
  {
    id: "2",
    name: "Paquete Estándar",
    credits: 10,
    price: 90,
    qrCodeUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Commons_QR_code.png",
    popular: true,
    bonus: 2
  },
  {
    id: "3", 
    name: "Paquete Premium",
    credits: 25,
    price: 200,
    qrCodeUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Commons_QR_code.png",
    bonus: 5
  }
];

export const mockCategories: Category[] = [
  { id: "sensores", nombre: "Sensores", descripcion: "Sensores de temperatura, humedad, proximidad, etc.", estado: "activo" },
  { id: "actuadores", nombre: "Actuadores", descripcion: "Motores, servos, actuadores lineales", estado: "activo" },
  { id: "microcontroladores", nombre: "Microcontroladores", descripcion: "Arduino, ESP32, PIC, STM32", estado: "activo" },
  { id: "componentes-pasivos", nombre: "Componentes Pasivos", descripcion: "Resistencias, condensadores, bobinas", estado: "activo" },
  { id: "semiconductores", nombre: "Semiconductores", descripcion: "Diodos, transistores, integrados", estado: "activo" },
  { id: "fuentes", nombre: "Fuentes de Alimentación", descripcion: "Reguladores, transformadores, baterías", estado: "activo" },
  { id: "conectores", nombre: "Conectores y Cables", descripcion: "Cables, conectores, terminales", estado: "activo" },
  { id: "herramientas", nombre: "Herramientas", descripcion: "Multímetros, soldadores, protoboards", estado: "activo" },
  { id: "modulos", nombre: "Módulos", descripcion: "WiFi, Bluetooth, GPS, comunicación", estado: "activo" }
];

export const mockRatings: Rating[] = [
  {
    id: "1",
    sellerId: "1",
    buyerId: "2", 
    productId: "1",
    rating: 5,
    feedback: "Excelente vendedor, producto como se describía",
    createdAt: "2024-12-15",
    meetingDate: "2024-12-14",
    meetingPointId: "1",
    type: "seller"
  },
  {
    id: "2",
    sellerId: "4",
    buyerId: "5",
    productId: "3", 
    rating: 4,
    feedback: "Buen producto, entrega puntual",
    createdAt: "2024-12-14",
    meetingDate: "2024-12-13",
    meetingPointId: "2",
    type: "seller"
  },
  {
    id: "3",
    sellerId: "1",
    buyerId: "2", 
    productId: "2",
    rating: 5,
    feedback: "Comprador muy responsable, llegó a tiempo",
    createdAt: "2024-12-12",
    meetingDate: "2024-12-11",
    meetingPointId: "3",
    type: "buyer"
  },
  {
    id: "4",
    sellerId: "4",
    buyerId: "5",
    productId: "5", 
    rating: 4,
    feedback: "Compradora seria, buena comunicación",
    createdAt: "2024-12-10",
    meetingDate: "2024-12-09",
    meetingPointId: "2",
    type: "buyer"
  },
  {
    id: "5",
    sellerId: "1",
    buyerId: "4",
    productId: "4", 
    rating: 5,
    feedback: "Vendedor confiable, producto de calidad",
    createdAt: "2024-12-08",
    meetingDate: "2024-12-07",
    meetingPointId: "1",
    type: "seller"
  },
  {
    id: "6",
    sellerId: "4",
    buyerId: "2",
    productId: "5", 
    rating: 4,
    feedback: "Compradora puntual y amable",
    createdAt: "2024-12-06",
    meetingDate: "2024-12-05",
    meetingPointId: "4",
    type: "buyer"
  }
];