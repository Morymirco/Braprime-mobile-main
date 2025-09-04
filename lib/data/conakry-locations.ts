export interface ConakryCommune {
  id: number;
  name: string;
  code: string;
  description: string;
  population_estimate: number;
  area_km2: number;
}

export interface ConakryQuartier {
  id: number;
  commune_id: number;
  name: string;
  code: string;
  description: string;
  population_estimate: number;
}

export interface CommuneWithQuartiers extends ConakryCommune {
  quartiers: ConakryQuartier[];
}

// Données statiques des communes de Conakry
export const CONAKRY_COMMUNES: ConakryCommune[] = [
  {
    id: 1,
    name: 'Kaloum',
    code: 'KAL',
    description: 'Centre-ville historique et administratif de Conakry',
    population_estimate: 85000,
    area_km2: 2.5
  },
  {
    id: 2,
    name: 'Dixinn',
    code: 'DIX',
    description: 'Zone universitaire et résidentielle',
    population_estimate: 120000,
    area_km2: 4.2
  },
  {
    id: 3,
    name: 'Ratoma',
    code: 'RAT',
    description: 'Zone résidentielle et commerciale',
    population_estimate: 180000,
    area_km2: 6.8
  },
  {
    id: 4,
    name: 'Matam',
    code: 'MAT',
    description: 'Zone portuaire et industrielle',
    population_estimate: 95000,
    area_km2: 3.1
  },
  {
    id: 5,
    name: 'Matoto',
    code: 'MTO',
    description: 'Zone résidentielle et agricole',
    population_estimate: 220000,
    area_km2: 8.5
  },
  {
    id: 6,
    name: 'Kagbelen',
    code: 'KAG',
    description: 'Zone périurbaine en développement',
    population_estimate: 75000,
    area_km2: 12.3
  }
];

// Données statiques des quartiers de Conakry
export const CONAKRY_QUARTIERS: ConakryQuartier[] = [
  // Quartiers de Kaloum
  { id: 1, commune_id: 1, name: 'Centre-ville', code: 'KAL-CV', description: 'Centre administratif et commercial', population_estimate: 15000 },
  { id: 2, commune_id: 1, name: 'Almamya', code: 'KAL-ALM', description: 'Zone résidentielle historique', population_estimate: 12000 },
  { id: 3, commune_id: 1, name: 'Sandervalia', code: 'KAL-SAN', description: 'Zone commerciale et administrative', population_estimate: 18000 },
  { id: 4, commune_id: 1, name: 'Boulbinet', code: 'KAL-BOU', description: 'Zone portuaire et de pêche', population_estimate: 8000 },
  { id: 5, commune_id: 1, name: 'Tata', code: 'KAL-TAT', description: 'Zone résidentielle', population_estimate: 10000 },
  { id: 6, commune_id: 1, name: 'Coronthie', code: 'KAL-COR', description: 'Zone résidentielle et commerciale', population_estimate: 12000 },

  // Quartiers de Dixinn
  { id: 7, commune_id: 2, name: 'Université Gamal Abdel Nasser', code: 'DIX-UGAN', description: 'Zone universitaire', population_estimate: 25000 },
  { id: 8, commune_id: 2, name: 'Lansanaya', code: 'DIX-LAN', description: 'Zone résidentielle', population_estimate: 15000 },
  { id: 9, commune_id: 2, name: 'Kipé', code: 'DIX-KIP', description: 'Zone résidentielle', population_estimate: 18000 },
  { id: 10, commune_id: 2, name: 'Dixinn Centre', code: 'DIX-CEN', description: 'Centre de la commune', population_estimate: 12000 },
  { id: 11, commune_id: 2, name: 'Dabondy', code: 'DIX-DAB', description: 'Zone résidentielle', population_estimate: 14000 },
  { id: 12, commune_id: 2, name: 'Kankan', code: 'DIX-KAN', description: 'Zone résidentielle', population_estimate: 16000 },
  { id: 13, commune_id: 2, name: 'Bambeto', code: 'DIX-BAM', description: 'Zone commerciale et résidentielle', population_estimate: 20000 },

  // Quartiers de Ratoma
  { id: 14, commune_id: 3, name: 'Ratoma Centre', code: 'RAT-CEN', description: 'Centre de la commune', population_estimate: 20000 },
  { id: 15, commune_id: 3, name: 'Cosa', code: 'RAT-COS', description: 'Zone résidentielle', population_estimate: 18000 },
  { id: 16, commune_id: 3, name: 'Koloma', code: 'RAT-KOL', description: 'Zone résidentielle', population_estimate: 16000 },
  { id: 17, commune_id: 3, name: 'Teminetaye', code: 'RAT-TEM', description: 'Zone résidentielle', population_estimate: 14000 },
  { id: 18, commune_id: 3, name: 'Kankan', code: 'RAT-KAN', description: 'Zone résidentielle', population_estimate: 15000 },
  { id: 19, commune_id: 3, name: 'Bambeto', code: 'RAT-BAM', description: 'Zone commerciale', population_estimate: 12000 },
  { id: 20, commune_id: 3, name: 'Kipé', code: 'RAT-KIP', description: 'Zone résidentielle', population_estimate: 17000 },
  { id: 21, commune_id: 3, name: 'Lansanaya', code: 'RAT-LAN', description: 'Zone résidentielle', population_estimate: 19000 },
  { id: 22, commune_id: 3, name: 'Dabondy', code: 'RAT-DAB', description: 'Zone résidentielle', population_estimate: 16000 },
  { id: 23, commune_id: 3, name: 'Dixinn', code: 'RAT-DIX', description: 'Zone résidentielle', population_estimate: 14000 },
  { id: 24, commune_id: 3, name: 'Almamya', code: 'RAT-ALM', description: 'Zone résidentielle', population_estimate: 13000 },

  // Quartiers de Matam
  { id: 25, commune_id: 4, name: 'Matam Centre', code: 'MAT-CEN', description: 'Centre de la commune', population_estimate: 15000 },
  { id: 26, commune_id: 4, name: 'Bambeto', code: 'MAT-BAM', description: 'Zone commerciale et résidentielle', population_estimate: 18000 },
  { id: 27, commune_id: 4, name: 'Cosa', code: 'MAT-COS', description: 'Zone résidentielle', population_estimate: 12000 },
  { id: 28, commune_id: 4, name: 'Koloma', code: 'MAT-KOL', description: 'Zone résidentielle', population_estimate: 14000 },
  { id: 29, commune_id: 4, name: 'Teminetaye', code: 'MAT-TEM', description: 'Zone résidentielle', population_estimate: 11000 },
  { id: 30, commune_id: 4, name: 'Kankan', code: 'MAT-KAN', description: 'Zone résidentielle', population_estimate: 13000 },
  { id: 31, commune_id: 4, name: 'Kipé', code: 'MAT-KIP', description: 'Zone résidentielle', population_estimate: 12000 },

  // Quartiers de Matoto
  { id: 32, commune_id: 5, name: 'Matoto Centre', code: 'MTO-CEN', description: 'Centre de la commune', population_estimate: 25000 },
  { id: 33, commune_id: 5, name: 'Cosa', code: 'MTO-COS', description: 'Zone résidentielle', population_estimate: 22000 },
  { id: 34, commune_id: 5, name: 'Koloma', code: 'MTO-KOL', description: 'Zone résidentielle', population_estimate: 20000 },
  { id: 35, commune_id: 5, name: 'Teminetaye', code: 'MTO-TEM', description: 'Zone résidentielle', population_estimate: 18000 },
  { id: 36, commune_id: 5, name: 'Kankan', code: 'MTO-KAN', description: 'Zone résidentielle', population_estimate: 19000 },
  { id: 37, commune_id: 5, name: 'Bambeto', code: 'MTO-BAM', description: 'Zone commerciale', population_estimate: 15000 },
  { id: 38, commune_id: 5, name: 'Kipé', code: 'MTO-KIP', description: 'Zone résidentielle', population_estimate: 21000 },
  { id: 39, commune_id: 5, name: 'Lansanaya', code: 'MTO-LAN', description: 'Zone résidentielle', population_estimate: 23000 },
  { id: 40, commune_id: 5, name: 'Dabondy', code: 'MTO-DAB', description: 'Zone résidentielle', population_estimate: 20000 },
  { id: 41, commune_id: 5, name: 'Dixinn', code: 'MTO-DIX', description: 'Zone résidentielle', population_estimate: 18000 },
  { id: 42, commune_id: 5, name: 'Almamya', code: 'MTO-ALM', description: 'Zone résidentielle', population_estimate: 17000 },

  // Quartiers de Kagbelen
  { id: 43, commune_id: 6, name: 'Kagbelen Centre', code: 'KAG-CEN', description: 'Centre de la commune', population_estimate: 15000 },
  { id: 44, commune_id: 6, name: 'Cosa', code: 'KAG-COS', description: 'Zone résidentielle', population_estimate: 12000 },
  { id: 45, commune_id: 6, name: 'Koloma', code: 'KAG-KOL', description: 'Zone résidentielle', population_estimate: 14000 },
  { id: 46, commune_id: 6, name: 'Teminetaye', code: 'KAG-TEM', description: 'Zone résidentielle', population_estimate: 11000 },
  { id: 47, commune_id: 6, name: 'Kankan', code: 'KAG-KAN', description: 'Zone résidentielle', population_estimate: 13000 },
  { id: 48, commune_id: 6, name: 'Bambeto', code: 'KAG-BAM', description: 'Zone commerciale', population_estimate: 10000 }
];

// Fonctions utilitaires
export const getCommunes = (): ConakryCommune[] => {
  return CONAKRY_COMMUNES;
};

export const getQuartiersByCommune = (communeId: number): ConakryQuartier[] => {
  return CONAKRY_QUARTIERS.filter(quartier => quartier.commune_id === communeId);
};

export const getCommunesWithQuartiers = (): CommuneWithQuartiers[] => {
  return CONAKRY_COMMUNES.map(commune => ({
    ...commune,
    quartiers: getQuartiersByCommune(commune.id)
  }));
};

export const getCommuneByName = (name: string): ConakryCommune | null => {
  return CONAKRY_COMMUNES.find(commune => commune.name === name) || null;
};

export const getQuartierByNameAndCommune = (quartierName: string, communeName: string): ConakryQuartier | null => {
  const commune = getCommuneByName(communeName);
  if (!commune) return null;
  
  return CONAKRY_QUARTIERS.find(quartier => 
    quartier.name === quartierName && quartier.commune_id === commune.id
  ) || null;
};

export const searchCommuneQuartierByAddress = (address: string): { commune: string; quartier: string; found: boolean } => {
  const addressLower = address.toLowerCase();
  
  // Recherche de commune
  const foundCommune = CONAKRY_COMMUNES.find(commune => 
    addressLower.includes(commune.name.toLowerCase())
  );
  
  // Recherche de quartier
  const foundQuartier = CONAKRY_QUARTIERS.find(quartier => 
    addressLower.includes(quartier.name.toLowerCase())
  );
  
  return {
    commune: foundCommune?.name || '',
    quartier: foundQuartier?.name || '',
    found: !!(foundCommune || foundQuartier)
  };
};
