import { User, Product, MeetingPoint, CreditPackage, Category, Rating } from "./types";
// cambios
export const mockUsers: User[] = [
  {
    id: "3",
    username: "juan_tech",
    email: "juan@electromarket.com",
    role: "user",
    registrationDate: "2024-01-15",
    rating: 4.8,
    totalTransactions: 23,
    credits: 15,
    isSeller: true,
    isBuyer: true
  },
  {
    id: "2", 
    username: "maria_buyer",
    email: "maria@electromarket.com",
    role: "user",
    registrationDate: "2024-02-10",
    rating: 4.9,
    totalTransactions: 12,
    credits: 0,
    isSeller: false,
    isBuyer: true
  },
  {
    id: "1",
    username: "Admin",
    email: "admin@electromarket.com", 
    role: "admin",
    registrationDate: "2023-12-01",
    rating: 5.0,
    totalTransactions: 0,
    credits: 0,
    isSeller: false,
    isBuyer: false
  },
  {
    id: "4",
    username: "tech_seller",
    email: "tech@electromarket.com",
    role: "user", 
    registrationDate: "2024-03-05",
    rating: 4.6,
    totalTransactions: 8,
    credits: 22,
    isSeller: true,
    isBuyer: false
  },
  {
    id: "5",
    username: "ana_gamer",
    email: "ana@electromarket.com",
    role: "user",
    registrationDate: "2024-01-20",
    rating: 4.7,
    totalTransactions: 5,
    credits: 0,
    isSeller: false,
    isBuyer: true
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
    name: "Plaza San Francisco",
    address: "Plaza San Francisco, La Paz, Bolivia",
    coordinates: { lat: -16.4955, lng: -68.1336 },
    zone: "centro"
  },
  {
    id: "2", 
    name: "Centro Comercial Megacenter",
    address: "Av. Rafael Pabón, La Paz, Bolivia",
    coordinates: { lat: -16.5000, lng: -68.1193 },
    zone: "sur"
  },
  {
    id: "3",
    name: "Universidad Mayor de San Andrés",
    address: "Av. Villazón 1995, La Paz, Bolivia", 
    coordinates: { lat: -16.5402, lng: -68.0731 },
    zone: "centro"
  },
  {
    id: "4",
    name: "Plaza Abaroa",
    address: "Plaza Abaroa, La Paz, Bolivia",
    coordinates: { lat: -16.4890, lng: -68.1450 },
    zone: "norte"
  },
  {
    id: "5",
    name: "Mercado Rodríguez",
    address: "Mercado Rodríguez, La Paz, Bolivia",
    coordinates: { lat: -16.4980, lng: -68.1380 },
    zone: "centro"
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
  { id: "sensores", name: "Sensores", description: "Sensores de temperatura, humedad, proximidad, etc." },
  { id: "actuadores", name: "Actuadores", description: "Motores, servos, actuadores lineales" },
  { id: "microcontroladores", name: "Microcontroladores", description: "Arduino, ESP32, PIC, STM32" },
  { id: "componentes-pasivos", name: "Componentes Pasivos", description: "Resistencias, condensadores, bobinas" },
  { id: "semiconductores", name: "Semiconductores", description: "Diodos, transistores, integrados" },
  { id: "fuentes", name: "Fuentes de Alimentación", description: "Reguladores, transformadores, baterías" },
  { id: "conectores", name: "Conectores y Cables", description: "Cables, conectores, terminales" },
  { id: "herramientas", name: "Herramientas", description: "Multímetros, soldadores, protoboards" },
  { id: "modulos", name: "Módulos", description: "WiFi, Bluetooth, GPS, comunicación" }
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