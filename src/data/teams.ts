export interface StickerDef {
  number: string
  label: string
  type: 'badge' | 'photo' | 'player' | 'special'
}

export interface Team {
  code: string
  name: string
  group: string
  flagCode: string
  primaryColor: string
  stickers: StickerDef[]
}

export interface SpecialSection {
  code: string
  name: string
  section: 'fwc' | 'cocacola'
  stickers: StickerDef[]
}

// Estrutura real do álbum Panini Copa 2026:
// N1 = Escudo (badge), N2-N19 = 18 jogadores, N20 = Seleção (foto da equipe)
function players(names: string[]): StickerDef[] {
  return [
    { number: '1', label: 'Escudo', type: 'badge' },
    ...names.map((name, i) => ({
      number: String(i + 2),
      label: name,
      type: 'player' as const,
    })),
    { number: '20', label: 'Seleção', type: 'photo' },
  ]
}

function genericPlayers(count = 18): string[] {
  return Array.from({ length: count }, (_, i) => `Jogador ${i + 1}`)
}

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export const GROUP_COLORS: Record<string, string> = {
  A: '#ef4444',
  B: '#f97316',
  C: '#eab308',
  D: '#22c55e',
  E: '#14b8a6',
  F: '#0ea5e9',
  G: '#6366f1',
  H: '#8b5cf6',
  I: '#ec4899',
  J: '#f43f5e',
  K: '#10b981',
  L: '#f5c42e',
}

export const TEAMS: Team[] = [
  // ─── GRUPO A ────────────────────────────────────────────────────
  {
    code: 'MEX', name: 'México', group: 'A', flagCode: 'mx', primaryColor: '#006847',
    stickers: players([
      'Luis Malagón', 'Johan Vásquez', 'Jorge Sánchez', 'César Montes',
      'Jesús Gallardo', 'Israel Reyes', 'Diego Lainez', 'Carlos Rodríguez',
      'Edson Álvarez', 'Orbelín Pineda', 'Marcel Ruiz', 'Érick Sánchez',
      'Hirving Lozano', 'Santiago Giménez', 'Raúl Jiménez', 'Alexis Vega',
      'Roberto Alvarado', 'César Huerta',
    ]),
  },
  {
    code: 'RSA', name: 'África do Sul', group: 'A', flagCode: 'za', primaryColor: '#007A4D',
    stickers: players([
      'Ronwen Williams', 'Sipho Chaine', 'Aubrey Modiba', 'Samukele Kabini',
      'Mbekezeli Mbokazi', 'Khulumani Ndamane', 'Siyabonga Ngezana', 'Khuliso Mudau',
      'Nkosinathi Sibisi', 'Teboho Mokoena', 'Thalente Mbatha', 'Bathuisi Aubaas',
      'Yaya Sithole', 'Sipho Mbule', 'Lyle Foster', 'Ioraam Rayners',
      'Mohau Nkota', 'Oswin Appolis',
    ]),
  },
  {
    code: 'KOR', name: 'Coréia do Sul', group: 'A', flagCode: 'kr', primaryColor: '#C60C30',
    stickers: players([
      'Hyeon-woo Jo', 'Seung-Gyu Kim', 'Min-jae Kim', 'Yu-min Cho',
      'Young-woo Seol', 'Han-beom Lee', 'Tae-seok Lee', 'Myung-jae Lee',
      'Jae-sung Lee', 'In-beom Hwang', 'Kang-in Lee', 'Seung-ho Paik',
      'Jens Castrop', 'Dong-gyeong Lee', 'Gue-sung Cho', 'Heung-min Son',
      'Hee-chan Hwang', 'Hyeon-Gyu Oh',
    ]),
  },
  {
    code: 'CZE', name: 'Rep. Tcheca', group: 'A', flagCode: 'cz', primaryColor: '#D7141A',
    stickers: players([
      'Matěj Kovář', 'Jindřích Staněk', 'Ladislav Krejčí', 'Vladimír Coufal',
      'Jaroslav Zelený', 'Tomáš Holeš', 'David Zima', 'Michal Sadílek',
      'Lukáš Provod', 'Lukáš Červ', 'Tomáš Souček', 'Pavel Šulc',
      'Matěj Vydra', 'Vasil Kušej', 'Tomáš Chorý', 'Václav Černý',
      'Adam Hložek', 'Patrik Schick',
    ]),
  },

  // ─── GRUPO B ────────────────────────────────────────────────────
  {
    code: 'CAN', name: 'Canadá', group: 'B', flagCode: 'ca', primaryColor: '#FF0000',
    stickers: players([
      'Dayne St. Clair', 'Alphonso Davies', 'Alistair Johnston', 'Samuel Adekugbe',
      'Richie Laryea', 'Derek Cornelius', 'Moïse Bombito', 'Kamal Miller',
      'Stephen Eustáquio', 'Ismaël Koné', 'Jonathan Osorio', 'Jacob Shaffelburg',
      'Mathieu Choinière', 'Niko Sigur', 'Tajon Buchanan', 'Liam Millar',
      'Cyle Larin', 'Jonathan David',
    ]),
  },
  {
    code: 'BIH', name: 'Bósnia', group: 'B', flagCode: 'ba', primaryColor: '#002395',
    stickers: players([
      'Nikola Vasilj', 'Amar Dedić', 'Sead Kolašinac', 'Tarik Muharemović',
      'Nihad Mujakić', 'Nikola Katić', 'Amir Hadžiahmetović', 'Benjamin Tahirović',
      'Armin Gigović', 'Ivan Šunjić', 'Ivan Bašić', 'Dženis Burnić',
      'Esmir Bajraktarević', 'Amar Memić', 'Ermedin Demirović', 'Edin Džeko',
      'Samed Baždar', 'Haris Tabaković',
    ]),
  },
  {
    code: 'QAT', name: 'Catar', group: 'B', flagCode: 'qa', primaryColor: '#8D1B3D',
    stickers: players([
      'Meshaal Barsham', 'Sultan Albrake', 'Lucas Mendes', 'Homam Ahmed',
      'Boualem Khoukhi', 'Pedro Miguel', 'Tarek Salman', 'Mohamed Al-Mannai',
      'Karim Boudiaf', 'Assim Madibo', 'Ahmed Fatehi', 'Mohammed Waad',
      'Abdulaziz Hatem', 'Hassan Al-Haydos', 'Edmilson Junior', 'Akram Hassan Afif',
      'Ahmed Al Ganehi', 'Almoez Ali',
    ]),
  },
  {
    code: 'SUI', name: 'Suíça', group: 'B', flagCode: 'ch', primaryColor: '#FF0000',
    stickers: players([
      'Gregor Kobel', 'Yvon Mvogo', 'Manuel Akanji', 'Ricardo Rodriguez',
      'Nico Elvedi', 'Aurèle Amenda', 'Silvan Widmer', 'Granit Xhaka',
      'Denis Zakaria', 'Remo Freuler', 'Fabian Rieder', 'Ardon Jashari',
      'Johan Manzambi', 'Michel Aebischer', 'Breel Embolo', 'Ruben Vargas',
      'Dan Ndoye', 'Zeki Amdouni',
    ]),
  },

  // ─── GRUPO C ────────────────────────────────────────────────────
  {
    code: 'BRA', name: 'Brasil', group: 'C', flagCode: 'br', primaryColor: '#009C3B',
    stickers: players([
      'Alisson', 'Bento', 'Marquinhos', 'Éder Militão',
      'Gabriel Magalhães', 'Danilo', 'Wesley', 'Lucas Paquetá',
      'Casemiro', 'Bruno Guimarães', 'Luiz Henrique', 'Vinícius Júnior',
      'Rodrygo', 'João Pedro', 'Matheus Cunha', 'Gabriel Martinelli',
      'Raphinha', 'Estêvão',
    ]),
  },
  {
    code: 'MAR', name: 'Marrocos', group: 'C', flagCode: 'ma', primaryColor: '#C1272D',
    stickers: players([
      'Yassine Bounou', 'Munir El Kajoui', 'Achraf Hakimi', 'Noussair Mazraoui',
      'Nayef Aguerd', 'Romain Saïss', 'Jawad El Yamiq', 'Adam Masina',
      'Sofyan Amrabat', 'Azzedine Ounahi', 'Eliesse Ben Seghir', 'Bilal El Khannouss',
      'Ismael Saibari', 'Youssef En-Nesyri', 'Abde Ezzalzouli', 'Soufiane Rahimi',
      'Brahim Díaz', 'Ayoub El Kaabi',
    ]),
  },
  {
    code: 'HAI', name: 'Haiti', group: 'C', flagCode: 'ht', primaryColor: '#00209F',
    stickers: players([
      'Johny Placide', 'Carlens Arcus', 'Martin Expérience', 'Jean-Kevin Duverne',
      'Ricardo Adé', 'Duke Lacroix', 'Garven Metusala', 'Hannes Delcroix',
      'Leverton Pierre', 'Danley Jean Jacques', 'Jean-Ricner Bellegarde', 'Christopher Attys',
      'Derrick Etienne Jr.', 'Josué Casimir', 'Ruben Providence', 'Duckens Nazon',
      'Louicius Deedson', 'Frantzdy Pierrot',
    ]),
  },
  {
    code: 'SCO', name: 'Escócia', group: 'C', flagCode: 'gb-sct', primaryColor: '#0065BD',
    stickers: players([
      'Angus Gunn', 'Jack Hendry', 'Kieran Tierney', 'Aaron Hickey',
      'Andrew Robertson', 'Scott McKenna', 'John Souttar', 'Anthony Ralston',
      'Grant Hanley', 'Scott McTominay', 'Billy Gilmour', 'Lewis Ferguson',
      'Ryan Christie', 'Kenny McLean', 'John McGinn', 'Lyndon Dykes',
      'Che Adams', 'Ben Gannon-Doak',
    ]),
  },

  // ─── GRUPO D ────────────────────────────────────────────────────
  {
    code: 'USA', name: 'Estados Unidos', group: 'D', flagCode: 'us', primaryColor: '#002868',
    stickers: players([
      'Matt Freese', 'Chris Richards', 'Tim Ream', 'Mark McKenzie',
      'Alex Freeman', 'Antonee Robinson', 'Tyler Adams', 'Tanner Tessmann',
      'Weston McKennie', 'Christian Roldan', 'Timothy Weah', 'Diego Luna',
      'Malik Tillman', 'Christian Pulisic', 'Brenden Aaronson', 'Ricardo Pepi',
      'Haji Wright', 'Folarin Balogun',
    ]),
  },
  {
    code: 'PAR', name: 'Paraguai', group: 'D', flagCode: 'py', primaryColor: '#D52B1E',
    stickers: players([
      'Roberto Fernández', 'Orlando Gill', 'Gustavo Gómez', 'Fabián Balbuena',
      'Juan José Cáceres', 'Omar Alderete', 'Junior Alonso', 'Mathías Villasanti',
      'Diego Gómez', 'Damián Bobadilla', 'Andrés Cubas', 'Matías Galarza Fonda',
      'Julio Enciso', 'Antonio Sanabria', 'Miguel Almirón', 'Santiago Arzamendia',
      'Ramón Sosa', 'Carlos González',
    ]),
  },
  {
    code: 'AUS', name: 'Austrália', group: 'D', flagCode: 'au', primaryColor: '#00843D',
    stickers: players([
      'Mathew Ryan', 'Joe Gauci', 'Harry Souttar', 'Alessandro Circati',
      'Jordan Bos', 'Aziz Behich', 'Cameron Burgess', 'Lewis Miller',
      'Milos Degenek', 'Jackson Irvine', 'Riley McGree', 'Aiden O\'Neill',
      'Connor Metcalfe', 'Patrick Yazbek', 'Craig Goodwin', 'Kusini Yengi',
      'Nestory Irankunda', 'Mohamed Touré',
    ]),
  },
  {
    code: 'TUR', name: 'Turquia', group: 'D', flagCode: 'tr', primaryColor: '#E30A17',
    stickers: players([
      'Ugurcan Cakir', 'Mert Muldur', 'Zeki Celik', 'Abdulkerim Bardakci',
      'Caglar Soyuncu', 'Merih Demiral', 'Ferdi Kadioglu', 'Kaan Ayhan',
      'Ismail Yuksek', 'Hakan Calhanoglu', 'Orkun Kokcu', 'Arda Güler',
      'Irfan Can Kahveci', 'Yunus Akgun', 'Can Uzun', 'Baris Alper Yilmaz',
      'Kerem Akturkoglu', 'Kenan Yildiz',
    ]),
  },

  // ─── GRUPO E ────────────────────────────────────────────────────
  {
    code: 'GER', name: 'Alemanha', group: 'E', flagCode: 'de', primaryColor: '#000000',
    stickers: players([
      'Marc-André ter Stegen', 'Jonathan Tah', 'David Raum', 'Nico Schlotterbeck',
      'Antonio Rüdiger', 'Waldemar Anton', 'Ridle Baku', 'Maximilian Mittelstädt',
      'Joshua Kimmich', 'Florian Wirtz', 'Felix Nmecha', 'Leon Goretzka',
      'Jamal Musiala', 'Serge Gnabry', 'Kai Havertz', 'Leroy Sané',
      'Karim Adeyemi', 'Nick Woltemade',
    ]),
  },
  {
    code: 'CUW', name: 'Curaçao', group: 'E', flagCode: 'cw', primaryColor: '#002B7F',
    stickers: players([
      'Eloy Room', 'Armando Obispo', 'Sherel Floranus', 'Jurien Gaari',
      'Joshua Brenet', 'Roshon Van Eijma', 'Shurandy Sambo', 'Livano Comenencia',
      'Godfried Roemeratoe', 'Juninho Bacuna', 'Leandro Bacuna', 'Tahith Chong',
      'Kenji Gorré', 'Jearl Margaritha', 'Jurgen Locadia', 'Jeremy Antonisse',
      'Gervane Kastaneer', 'Sontje Hansen',
    ]),
  },
  {
    code: 'CIV', name: 'Costa do Marfim', group: 'E', flagCode: 'ci', primaryColor: '#F77F00',
    stickers: players([
      'Yahia Fofana', 'Ghislain Konan', 'Wilfried Singo', 'Odilon Kossounou',
      'Evan Ndicka', 'Willy Boly', 'Emmanuel Agbadou', 'Ousmane Diomande',
      'Franck Kessié', 'Seko Fofana', 'Ibrahim Sangaré', 'Jean-Philippe Gbamin',
      'Amad Diallo', 'Sébastien Haller', 'Simon Adingra', 'Yan Diomande',
      'Evann Guessand', 'Oumar Diakité',
    ]),
  },
  {
    code: 'ECU', name: 'Equador', group: 'E', flagCode: 'ec', primaryColor: '#FFD100',
    stickers: players([
      'Hernán Galíndez', 'Gonzalo Valle', 'Piero Hincapié', 'Pervis Estupiñán',
      'Willian Pacho', 'Ángelo Preciado', 'Joel Ordóñez', 'Moisés Caicedo',
      'Alan Franco', 'Kendry Páez', 'Pedro Vite', 'John Veboah',
      'Leonardo Campana', 'Gonzalo Plata', 'Nilson Angulo', 'Alan Minda',
      'Kevin Rodríguez', 'Enner Valencia',
    ]),
  },

  // ─── GRUPO F ────────────────────────────────────────────────────
  {
    code: 'NED', name: 'Holanda', group: 'F', flagCode: 'nl', primaryColor: '#FF6300',
    stickers: players([
      'Bart Verbruggen', 'Virgil van Dijk', 'Micky van de Ven', 'Jurriën Timber',
      'Denzel Dumfries', 'Nathan Aké', 'Jeremie Frimpong', 'Jan Paul van Hecke',
      'Tijjani Reijnders', 'Ryan Gravenberch', 'Teun Koopmeiners', 'Frenkie de Jong',
      'Xavi Simons', 'Justin Kluivert', 'Memphis Depay', 'Donyell Malen',
      'Wout Weghorst', 'Cody Gakpo',
    ]),
  },
  {
    code: 'JPN', name: 'Japão', group: 'F', flagCode: 'jp', primaryColor: '#BC002D',
    stickers: players([
      'Zion Suzuki', 'Henry Heroki Mochizuki', 'Ayumu Seko', 'Junnosuke Suzuki',
      'Shogo Taniguchi', 'Tsuyoshi Watanabe', 'Kaishu Sano', 'Yuki Soma',
      'Ao Tanaka', 'Daichi Kamada', 'Takefusa Kubo', 'Ritsu Doan',
      'Keito Nakamura', 'Takumi Minamino', 'Shuto Machino', 'Junya Ito',
      'Koki Ogawa', 'Ayase Ueda',
    ]),
  },
  {
    code: 'SWE', name: 'Suécia', group: 'F', flagCode: 'se', primaryColor: '#006AA7',
    stickers: players([
      'Victor Johansson', 'Isak Hien', 'Gabriel Gudmundsson', 'Emil Holm',
      'Victor Nilsson Lindelöf', 'Gustaf Lagerbielke', 'Lucas Bergvall', 'Hugo Larsson',
      'Jesper Karlström', 'Yasin Ayari', 'Mattias Svanberg', 'Daniel Svensson',
      'Ken Sema', 'Roony Bardghji', 'Dejan Kulusevski', 'Anthony Elanga',
      'Alexander Isak', 'Viktor Gyökeres',
    ]),
  },
  {
    code: 'TUN', name: 'Tunísia', group: 'F', flagCode: 'tn', primaryColor: '#E70013',
    stickers: players([
      'Bechir Ben Said', 'Aymen Dahmen', 'Van Valery', 'Montassar Talbi',
      'Yassine Meriah', 'Ali Abdi', 'Dylan Bronn', 'Ellyes Skhiri',
      'Aissa Laidouni', 'Ferjani Sassi', 'Mohamed Ali Ben Romdhane', 'Hannibal Mejbri',
      'Elias Achouri', 'Elias Saad', 'Hazem Mastouri', 'Ismael Gharbi',
      'Sayfallah Ltaief', 'Naim Sliti',
    ]),
  },

  // ─── GRUPO G ────────────────────────────────────────────────────
  {
    code: 'BEL', name: 'Bélgica', group: 'G', flagCode: 'be', primaryColor: '#EF3340',
    stickers: players([
      'Thibaut Courtois', 'Arthur Theate', 'Timothy Castagne', 'Zeno Debast',
      'Brandon Mechele', 'Maxim De Cuyper', 'Thomas Meunier', 'Youri Tielemans',
      'Amadou Onana', 'Nicolas Raskin', 'Alexis Saelemaekers', 'Hans Vanaken',
      'Kevin De Bruyne', 'Jérémy Doku', 'Charles De Ketelaere', 'Leandro Trossard',
      'Loïs Openda', 'Romelu Lukaku',
    ]),
  },
  {
    code: 'EGY', name: 'Egito', group: 'G', flagCode: 'eg', primaryColor: '#CE1126',
    stickers: players([
      'Mohamed El Shenawy', 'Mohamed Hany', 'Mohamed Hamdy', 'Yasser Ibrahim',
      'Khaled Sobhi', 'Ramy Rabia', 'Hossam Abdelmaguid', 'Ahmed Fatouh',
      'Marwan Attia', 'Zizo', 'Hamdy Fathy', 'Mohamed Lasheen',
      'Emam Ashour', 'Osama Faisal', 'Mohamed Salah', 'Mostafa Mohamed',
      'Trezeguet', 'Omar Marmoush',
    ]),
  },
  {
    code: 'IRN', name: 'Irã', group: 'G', flagCode: 'ir', primaryColor: '#239F40',
    stickers: players([
      'Alireza Beiranvand', 'Morteza Pouraliganji', 'Ehsan Hajsafi', 'Milad Mohammadi',
      'Shoja Khalilzadeh', 'Ramin Rezaeian', 'Hossein Kanaani', 'Sadegh Moharrami',
      'Saleh Hardani', 'Saeed Ezatolahi', 'Saman Ghoddos', 'Omid Noorafkan',
      'Roozbeh Cheshmi', 'Mohammad Mohebi', 'Sardar Azmoun', 'Mehdi Taremi',
      'Alireza Jahanbakhsh', 'Ali Gholizadeh',
    ]),
  },
  {
    code: 'NZL', name: 'Nova Zelândia', group: 'G', flagCode: 'nz', primaryColor: '#00247D',
    stickers: players([
      'Max Crocombe-Payne', 'Alex Paulsen', 'Michael Boxall', 'Liberato Cacace',
      'Tim Payne', 'Tyler Bindon', 'Francis de Vries', 'Finn Surman',
      'Joe Bell', 'Sarpreet Singh', 'Ryan Thomas', 'Matthew Garbett',
      'Marko Stamenić', 'Ben Old', 'Chris Wood', 'Elijah Just',
      'Callum McCowatt', 'Kosta Barbarouses',
    ]),
  },

  // ─── GRUPO H ────────────────────────────────────────────────────
  {
    code: 'ESP', name: 'Espanha', group: 'H', flagCode: 'es', primaryColor: '#AA151B',
    stickers: players([
      'Unai Simón', 'Robin Le Normand', 'Aymeric Laporte', 'Dean Huijsen',
      'Pedro Porro', 'Dani Carvajal', 'Marc Cucurella', 'Martín Zubimendi',
      'Rodri', 'Pedri', 'Fabián Ruiz', 'Mikel Merino',
      'Lamine Yamal', 'Dani Olmo', 'Nico Williams', 'Ferran Torres',
      'Álvaro Morata', 'Mikel Oyarzabal',
    ]),
  },
  {
    code: 'CPV', name: 'Cabo Verde', group: 'H', flagCode: 'cv', primaryColor: '#003893',
    stickers: players([
      'Vozinha', 'Logan Costa', 'Pico', 'Diney',
      'Steven Moreira', 'Wagner Pina', 'João Paulo', 'Yannick Semedo',
      'Kevin Pina', 'Patrick Andrade', 'Jamiro Monteiro', 'Deroy Duarte',
      'Garry Rodrigues', 'Jovane Cabral', 'Ryan Mendes', 'Dailon Livramento',
      'Willy Semedo', 'Bebé',
    ]),
  },
  {
    code: 'KSA', name: 'Arábia Saudita', group: 'H', flagCode: 'sa', primaryColor: '#006C35',
    stickers: players([
      'Nawaf Alaqidi', 'Abdulrahman Al-Sanbi', 'Saud Abdulhamid', 'Nawaf Boushal',
      'Jihad Thakri', 'Moteb Al-Harbi', 'Hassan Altambakti', 'Musab Aljuwayr',
      'Ziyad Aljohani', 'Abdullah Alkhaibari', 'Nasser Aldawsari', 'Saleh Abu Alshamat',
      'Marwan Alsahafi', 'Salem Aldawsari', 'Abdulrahman Al-Aboud', 'Feras Albrikan',
      'Saleh Alshehri', 'Abdullah Al-Hamdan',
    ]),
  },
  {
    code: 'URU', name: 'Uruguai', group: 'H', flagCode: 'uy', primaryColor: '#5EB6E4',
    stickers: players([
      'Sergio Rochet', 'Santiago Mele', 'Ronald Araujo', 'José María Giménez',
      'Sebastian Caceres', 'Mathias Olivera', 'Guillermo Varela', 'Nahitan Nandez',
      'Federico Valverde', 'Giorgian De Arrascaeta', 'Rodrigo Bentancur', 'Manuel Ugarte',
      'Nicolás de la Cruz', 'Maxi Araujo', 'Darwin Núñez', 'Federico Viñas',
      'Rodrigo Aguirre', 'Facundo Pellistri',
    ]),
  },

  // ─── GRUPO I ────────────────────────────────────────────────────
  {
    code: 'FRA', name: 'França', group: 'I', flagCode: 'fr', primaryColor: '#002395',
    stickers: players([
      'Mike Maignan', 'Theo Hernández', 'William Saliba', 'Jules Koundé',
      'Ibrahima Konaté', 'Dayot Upamecano', 'Lucas Digne', 'Aurélien Tchouaméni',
      'Eduardo Camavinga', 'Manu Koné', 'Adrien Rabiot', 'Michael Olise',
      'Ousmane Dembélé', 'Bradley Barcola', 'Désiré Doué', 'Kingsley Coman',
      'Hugo Ekitike', 'Kylian Mbappé',
    ]),
  },
  {
    code: 'SEN', name: 'Senegal', group: 'I', flagCode: 'sn', primaryColor: '#00853F',
    stickers: players([
      'Eduardo Mendy', 'Yehvann Diouf', 'Moussa Niakhaté', 'Abdoulaye Seck',
      'Ismail Jakobs', 'El Hadji Malick Diouf', 'Kalidou Koulibaly', 'Idrissa Gana Gueye',
      'Pape Matar Sarr', 'Pape Gueye', 'Habib Diarra', 'Lamine Camara',
      'Sadio Mane', 'Ismaïla Sarr', 'Boulaye Dia', 'Iliman Ndiaye',
      'Nicolas Jackson', 'Krepin Diatta',
    ]),
  },
  {
    code: 'IRQ', name: 'Iraque', group: 'I', flagCode: 'iq', primaryColor: '#CE1126',
    stickers: players([
      'Jalal Hassan', 'Rebin Sulaka', 'Hussein Ali', 'Akam Hashem',
      'Merchas Doski', 'Zaid Tahseen', 'Manaf Younis', 'Zidane Iqbal',
      'Amir Al-Ammari', 'Ibrahim Bayesh', 'Ali Jasim', 'Youssef Amyn',
      'Aimar Sher', 'Marko Farji', 'Osama Rashid', 'Ali Al-Hamadi',
      'Aymen Hussein', 'Mohanad Ali',
    ]),
  },
  {
    code: 'NOR', name: 'Noruega', group: 'I', flagCode: 'no', primaryColor: '#EF2B2D',
    stickers: players([
      'Ørjan Nyland', 'Julian Ryerson', 'Leo Østigård', 'Kristoffer Ajer',
      'Marcus Holmgren Pedersen', 'David Møller Wolfe', 'Torbjørn Heggem', 'Morten Thorsby',
      'Martin Ødegaard', 'Sander Berge', 'Andreas Schjelderup', 'Patrick Berg',
      'Erling Haaland', 'Alexander Sørloth', 'Aron Dønnum', 'Jørgen Strand Larsen',
      'Antonio Nusa', 'Oscar Bobb',
    ]),
  },

  // ─── GRUPO J ────────────────────────────────────────────────────
  {
    code: 'ARG', name: 'Argentina', group: 'J', flagCode: 'ar', primaryColor: '#74ACDF',
    stickers: players([
      'Emiliano Martínez', 'Nahuel Molina', 'Cristian Romero', 'Nicolás Otamendi',
      'Nicolás Tagliafico', 'Leonardo Balerdi', 'Enzo Fernández', 'Alexis Mac Allister',
      'Rodrigo De Paul', 'Exequiel Palacios', 'Leandro Paredes', 'Nico Paz',
      'Franco Mastantuono', 'Nico González', 'Lionel Messi', 'Lautaro Martínez',
      'Julián Álvarez', 'Giuliano Simeone',
    ]),
  },
  {
    code: 'ALG', name: 'Argélia', group: 'J', flagCode: 'dz', primaryColor: '#006233',
    stickers: players([
      'Alexis Guendouz', 'Ramy Bensebaini', 'Youcef Atal', 'Rayan Aït-Nouri',
      'Mohamed Amine Tougai', 'Aïssa Mandi', 'Ismael Bennacer', 'Houssem Aouar',
      'Hicham Boudaoui', 'Ramiz Zerrouki', 'Nabil Bentaleb', 'Farés Chaibi',
      'Riyad Mahrez', 'Said Benrahma', 'Anis Hadj Moussa', 'Amine Gouiri',
      'Baghdad Bounedjah', 'Mohammed Amoura',
    ]),
  },
  {
    code: 'AUT', name: 'Áustria', group: 'J', flagCode: 'at', primaryColor: '#ED2939',
    stickers: players([
      'Alexander Schlager', 'Patrick Pentz', 'David Alaba', 'Kevin Danso',
      'Philipp Lienhart', 'Stefan Posch', 'Phillipp Mwene', 'Alexander Prass',
      'Xaver Schlager', 'Marcel Sabitzer', 'Konrad Laimer', 'Florian Grillitsch',
      'Nicolas Seiwald', 'Romano Schmid', 'Patrick Wimmer', 'Christoph Baumgartner',
      'Michael Gregoritsch', 'Marko Arnautović',
    ]),
  },
  {
    code: 'JOR', name: 'Jordânia', group: 'J', flagCode: 'jo', primaryColor: '#007A3D',
    stickers: players([
      'Yazeed Abulaila', 'Ihsan Haddad', 'Mohammad Abu Hashish', 'Yazan Al-Arab',
      'Abdallah Nasib', 'Saleem Obaid', 'Mohammad Abualnadi', 'Ibrahim Saadeh',
      'Nizar Al-Rashdan', 'Noor Al-Rawabdeh', 'Mohannad Abu Taha', 'Amer Jamous',
      'Musa Al-Taamari', 'Yazan Al-Naimat', 'Mahmoud Al-Mardi', 'Ali Olwan',
      'Mohammad Abu Zrayq', 'Ibrahim Sabra',
    ]),
  },

  // ─── GRUPO K ────────────────────────────────────────────────────
  {
    code: 'POR', name: 'Portugal', group: 'K', flagCode: 'pt', primaryColor: '#006600',
    stickers: players([
      'Diogo Costa', 'Jose Sa', 'Ruben Dias', 'João Cancelo',
      'Diogo Dalot', 'Nuno Mendes', 'Gonçalo Inácio', 'Bernardo Silva',
      'Bruno Fernandes', 'Ruben Neves', 'Vitinha', 'João Neves',
      'Cristiano Ronaldo', 'Francisco Trincão', 'João Felix', 'Gonçalo Ramos',
      'Pedro Neto', 'Rafael Leão',
    ]),
  },
  {
    code: 'COD', name: 'Congo', group: 'K', flagCode: 'cd', primaryColor: '#007FFF',
    stickers: players([
      'Lionel Mpasi', 'Aaron Wan-Bissaka', 'Axel Tuanzebe', 'Arthur Masuaku',
      'Chancel Mbemba', 'Joris Kayembe', 'Charles Pickel', 'Ngal\'ayel Mukau',
      'Edo Kayembe', 'Samuel Moutoussamy', 'Noah Sadiki', 'Théo Bongonda',
      'Meschack Elia', 'Yoane Wissa', 'Brian Cipenga', 'Fiston Mayele',
      'Cédric Bakambu', 'Nathanaël Mbuku',
    ]),
  },
  {
    code: 'UZB', name: 'Uzbequistão', group: 'K', flagCode: 'uz', primaryColor: '#1EB53A',
    stickers: players([
      'Utkir Yusupov', 'Farrukh Savfiev', 'Sherzod Nasrullaev', 'Umar Eshmurodov',
      'Husniddin Aliqulov', 'Rustamjon Ashurmatov', 'Khojiakbar Alijonov', 'Abdukodir Khusanov',
      'Odiljon Hamrobekov', 'Otabek Shukurov', 'Jamshid Iskanderov', 'Azizbek Turgunboev',
      'Khojimat Erkinov', 'Eldor Shomurodov', 'Oston Urunov', 'Jaloliddin Masharipov',
      'Igor Sergeev', 'Abbosbek Fayzullaev',
    ]),
  },
  {
    code: 'COL', name: 'Colômbia', group: 'K', flagCode: 'co', primaryColor: '#FCD116',
    stickers: players([
      'Camilo Vargas', 'David Ospina', 'Dávinson Sánchez', 'Yerry Mina',
      'Daniel Muñoz', 'Johan Mojica', 'Jhon Lucumí', 'Santiago Arias',
      'Jefferson Lerma', 'Kevin Castaño', 'Richard Ríos', 'James Rodríguez',
      'Juan Fernando Quintero', 'Jorge Carrascal', 'Jhon Arias', 'Jhon Córdoba',
      'Luis Suárez', 'Luis Díaz',
    ]),
  },

  // ─── GRUPO L ────────────────────────────────────────────────────
  {
    code: 'ENG', name: 'Inglaterra', group: 'L', flagCode: 'gb-eng', primaryColor: '#CF142B',
    stickers: players([
      'Jordan Pickford', 'John Stones', 'Marc Guéhi', 'Ezri Konsa',
      'Trent Alexander-Arnold', 'Reece James', 'Dan Burn', 'Jordan Henderson',
      'Declan Rice', 'Jude Bellingham', 'Cole Palmer', 'Morgan Rogers',
      'Anthony Gordon', 'Phil Foden', 'Bukayo Saka', 'Harry Kane',
      'Marcus Rashford', 'Ollie Watkins',
    ]),
  },
  {
    code: 'CRO', name: 'Croácia', group: 'L', flagCode: 'hr', primaryColor: '#FF0000',
    stickers: players([
      'Dominik Livaković', 'Duje Ćaleta-Car', 'Joško Gvardiol', 'Josip Stanišić',
      'Luka Vušković', 'Josip Šutalo', 'Kristijan Jakić', 'Luka Modrić',
      'Mateo Kovačić', 'Martin Baturina', 'Lovro Majer', 'Mario Pašalić',
      'Petar Sučić', 'Ivan Perišić', 'Marco Pašalić', 'Ante Budimir',
      'Andrej Kramarić', 'Franjo Ivanović',
    ]),
  },
  {
    code: 'GHA', name: 'Gana', group: 'L', flagCode: 'gh', primaryColor: '#006B3F',
    stickers: players([
      'Lawrence Ati Zigi', 'Tariq Lamptey', 'Mohammed Salisu', 'Alidu Seidu',
      'Alexander Djiku', 'Gideon Mensah', 'Caleb Yirenkyi', 'Abdul Fatawu Issahaku',
      'Thomas Partey', 'Salis Abdul Samed', 'Kamaldeen Sulemana', 'Mohammed Kudus',
      'Iñaki Williams', 'Jordan Ayew', 'André Ayew', 'Joseph Paintsil',
      'Osman Bukari', 'Antoine Semenyo',
    ]),
  },
  {
    code: 'PAN', name: 'Panamá', group: 'L', flagCode: 'pa', primaryColor: '#DA121A',
    stickers: players([
      'Orlando Mosquera', 'Luis Mejía', 'Fidel Escobar', 'Andrés Andrade',
      'Michael Amir Murillo', 'Eric Davis', 'José Córdoba', 'César Blackman',
      'Cristian Martínez', 'Aníbal Godoy', 'Adalberto Carrasquilla', 'Édgar Bárcenas',
      'Carlos Harvey', 'Ismael Díaz', 'José Fajardo', 'Cecilio Waterman',
      'José Luis Rodríguez', 'Alberto Quintero',
    ]),
  },
]

// ─── SEÇÕES ESPECIAIS ─────────────────────────────────────────────

// ─── Página Inicial (00–8): introdução do álbum ─────────────────
// ─── FIFA World Cup History (9–19): história da Copa ────────────
export const FWC_SECTION: SpecialSection = {
  code: 'FWC',
  name: 'Páginas Iniciais & História',
  section: 'fwc',
  stickers: [
    { number: '00', label: 'Apresentação do Álbum', type: 'special' },
    { number: '1',  label: 'Mascote Oficial',        type: 'special' },
    { number: '2',  label: 'Troféu FIFA',             type: 'special' },
    { number: '3',  label: 'Bola Oficial',            type: 'special' },
    { number: '4',  label: 'Sede – Los Angeles',      type: 'special' },
    { number: '5',  label: 'Sede – New York/NJ',      type: 'special' },
    { number: '6',  label: 'Sede – Cidade do México', type: 'special' },
    { number: '7',  label: 'Sede – Toronto',          type: 'special' },
    { number: '8',  label: 'Sede – Vancouver',        type: 'special' },
    { number: '9',  label: 'Copa 1930 – Uruguai',     type: 'special' },
    { number: '10', label: 'Copa 1934 – Itália',      type: 'special' },
    { number: '11', label: 'Copa 1938 – Itália',      type: 'special' },
    { number: '12', label: 'Copa 1950 – Uruguai',     type: 'special' },
    { number: '13', label: 'Copa 1954 – Alemanha',    type: 'special' },
    { number: '14', label: 'Copa 1958 – Brasil',      type: 'special' },
    { number: '15', label: 'Copa 1962 – Brasil',      type: 'special' },
    { number: '16', label: 'Copa 1966 – Inglaterra',  type: 'special' },
    { number: '17', label: 'Copa 1970 – Brasil',      type: 'special' },
    { number: '18', label: 'Copa 1974 – Alemanha',    type: 'special' },
    { number: '19', label: 'Copa 1978-2022',          type: 'special' },
  ],
}

export const CC_SECTION: SpecialSection = {
  code: 'CC',
  name: 'Figurinhas Coca-Cola',
  section: 'cocacola',
  stickers: [
    { number: '1',  label: 'Lamine Yamal',      type: 'special' },
    { number: '2',  label: 'Joshua Kimmich',    type: 'special' },
    { number: '3',  label: 'Harry Kane',        type: 'special' },
    { number: '4',  label: 'Santiago Giménez',  type: 'special' },
    { number: '5',  label: 'Josko Gvardiol',    type: 'special' },
    { number: '6',  label: 'Federico Valverde', type: 'special' },
    { number: '7',  label: 'Jefferson Lerma',   type: 'special' },
    { number: '8',  label: 'Enner Valencia',    type: 'special' },
    { number: '9',  label: 'Gabriel Magalhães', type: 'special' },
    { number: '10', label: 'Virgil van Dijk',   type: 'special' },
    { number: '11', label: 'Alphonso Davies',   type: 'special' },
    { number: '12', label: 'Emiliano Martínez', type: 'special' },
    { number: '13', label: 'Raúl Jiménez',      type: 'special' },
    { number: '14', label: 'Lautaro Martínez',  type: 'special' },
  ],
}

export function getTeamsByGroup(group: string): Team[] {
  return TEAMS.filter((t) => t.group === group)
}

export function getTeamByCode(code: string): Team | undefined {
  return TEAMS.find((t) => t.code === code)
}

export const TOTAL_STICKERS =
  TEAMS.reduce((acc, t) => acc + t.stickers.length, 0) +
  FWC_SECTION.stickers.length +
  CC_SECTION.stickers.length
