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

function players(names: string[]): StickerDef[] {
  return [
    { number: '1', label: 'Escudo', type: 'badge' },
    { number: '2', label: 'Seleção', type: 'photo' },
    ...names.map((name, i) => ({
      number: String(i + 3),
      label: name,
      type: 'player' as const,
    })),
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
      'Guillermo Ochoa', 'Jorge Sánchez', 'César Montes', 'Johan Vásquez',
      'Jesús Gallardo', 'Edson Álvarez', 'Carlos Rodríguez', 'Héctor Herrera',
      'Hirving Lozano', 'Raúl Jiménez', 'Santiago Giménez', 'Roberto Alvarado',
      'Alexis Vega', 'Orbelin Pineda', 'Henry Martín', 'Alejandro Zendejas',
      'Luis Romo', 'Uriel Antuna',
    ]),
  },
  {
    code: 'RSA', name: 'África do Sul', group: 'A', flagCode: 'za', primaryColor: '#007A4D',
    stickers: players([
      'Ronwen Williams', 'Reeve Frosler', 'Rushine De Reuck', 'Nkosinathi Sibisi',
      'Sifiso Hlanti', 'Teboho Mokoena', 'Ethan Nthuli', 'Bongani Zungu',
      'Themba Zwane', 'Evidence Makgopa', 'Lyle Foster', 'Percy Tau',
      'Keagan Dolly', 'Mothobi Mvala', 'Grant Kekana', 'Deon Hotto',
      'Yusuf Maart', 'Fagrie Lakay',
    ]),
  },
  {
    code: 'KOR', name: 'Coréia do Sul', group: 'A', flagCode: 'kr', primaryColor: '#C60C30',
    stickers: players([
      'Kim Seung-gyu', 'Kim Moon-hwan', 'Kim Min-jae', 'Kim Young-gwon',
      'Hong Chul', 'Jung Woo-young', 'Son Heung-min', 'Lee Kang-in',
      'Hwang In-beom', 'Hwang Hee-chan', 'Cho Gue-sung', 'Kwon Chang-hoon',
      'Kim Jin-su', 'Paik Seung-ho', 'Oh Hyeon-gyu', 'Lim Chang-woo',
      'Lee Jae-sung', 'Song Min-kyu',
    ]),
  },
  {
    code: 'CZE', name: 'Rep. Tcheca', group: 'A', flagCode: 'cz', primaryColor: '#D7141A',
    stickers: players([
      'Jiří Pavlenka', 'Vladimir Coufal', 'Tomáš Holeš', 'Jakub Brabec',
      'Jan Bořil', 'Tomáš Souček', 'Vladimír Darida', 'Lukáš Provod',
      'Jakub Jankto', 'Patrik Schick', 'Adam Hložek', 'Ondřej Lingr',
      'Jan Kuchta', 'Ondřej Duda', 'Mojmír Chytil', 'David Jurásek',
      'Lukáš Červiček', 'Matěj Jurásek',
    ]),
  },

  // ─── GRUPO B ────────────────────────────────────────────────────
  {
    code: 'CAN', name: 'Canadá', group: 'B', flagCode: 'ca', primaryColor: '#FF0000',
    stickers: players([
      'Maxime Crépeau', 'Richie Laryea', 'Kamal Miller', 'Steven Vitória',
      'Sam Adekugbe', 'Atiba Hutchinson', 'Stephen Eustáquio', 'Mark-Anthony Kaye',
      'Alphonso Davies', 'Jonathan David', 'Cyle Larin', 'Tajon Buchanan',
      'Liam Millar', 'Lucas Cavallini', 'Alistair Johnston', 'Ismaël Koné',
      'Jacob Shaffelburg', 'Milan Borjan',
    ]),
  },
  {
    code: 'BIH', name: 'Bósnia', group: 'B', flagCode: 'ba', primaryColor: '#002395',
    stickers: players([
      'Kenan Pirić', 'Sead Kolašinac', 'Ermin Bičakčić', 'Anel Ahmedhodžić',
      'Borna Sosa', 'Miralem Pjanić', 'Damir Šabanović', 'Haris Hajradinović',
      'Edin Džeko', 'Ermedin Demirović', 'Kenan Kodro', 'Luka Menalo',
      'Amer Gojak', 'Dario Šarić', 'Amar Rahmanović', 'Nikola Maksimović',
      'Benjamin Tahirović', 'Strahinja Tanasijević',
    ]),
  },
  {
    code: 'QAT', name: 'Catar', group: 'B', flagCode: 'qa', primaryColor: '#8D1B3D',
    stickers: players([
      'Meshaal Barsham', 'Pedro Miguel', 'Abdelkarim Hassan', 'Bassam Al-Rawi',
      'Boualem Khoukhi', 'Assim Madibo', 'Karim Boudiaf', 'Akram Afif',
      'Hassan Al-Haydos', 'Almoez Ali', 'Mohammed Muntari', 'Abdulaziz Hatem',
      'Ismaeel Mohammad', 'Ahmed Alaaeldin', 'Khalid Muneer', 'Khaled Moein',
      'Abdullah Al-Ahrak', 'Yusuf Abdurisag',
    ]),
  },
  {
    code: 'SUI', name: 'Suíça', group: 'B', flagCode: 'ch', primaryColor: '#FF0000',
    stickers: players([
      'Yann Sommer', 'Silvan Widmer', 'Manuel Akanji', 'Nico Elvedi',
      'Ricardo Rodriguez', 'Granit Xhaka', 'Remo Freuler', 'Denis Zakaria',
      'Xherdan Shaqiri', 'Breel Embolo', 'Haris Seferovic', 'Ruben Vargas',
      'Fabian Rieder', 'Noah Okafor', 'Dan Ndoye', 'Michel Aebischer',
      'Christian Fassnacht', 'Zeki Amdouni',
    ]),
  },

  // ─── GRUPO C ────────────────────────────────────────────────────
  {
    code: 'BRA', name: 'Brasil', group: 'C', flagCode: 'br', primaryColor: '#009C3B',
    stickers: players([
      'Alisson', 'Danilo', 'Marquinhos', 'Gabriel Magalhães',
      'Guilherme Arana', 'Casemiro', 'Bruno Guimarães', 'Paquetá',
      'Vinicius Jr.', 'Rodrygo', 'Raphinha', 'Endrick',
      'Éder Militão', 'Gerson', 'Savinho', 'Matheus Cunha',
      'Yan Couto', 'Gabriel Martinelli',
    ]),
  },
  {
    code: 'MAR', name: 'Marrocos', group: 'C', flagCode: 'ma', primaryColor: '#C1272D',
    stickers: players([
      'Yassine Bounou', 'Achraf Hakimi', 'Romain Saïss', 'Nayef Aguerd',
      'Noussair Mazraoui', 'Sofyan Amrabat', 'Azzedine Ounahi', 'Selim Amallah',
      'Hakim Ziyech', 'Youssef En-Nesyri', 'Ilias Chair', 'Anass Salah-Eddine',
      'Bilal El Khannouss', 'Abdessamad Ezzalzouli', 'Soufiane Rahimi', 'Amine Harit',
      'Yahia Attiyat Allah', 'Hamza Moumi Ngangue',
    ]),
  },
  {
    code: 'HAI', name: 'Haiti', group: 'C', flagCode: 'ht', primaryColor: '#00209F',
    stickers: players([
      'Josué Duverger', 'Mechack Jérôme', 'Carlo Marcelin', 'Andrew Jean-Baptiste',
      'Frantzdy Pierrot', 'Steeven Saba', 'Derrick Etienne Jr.', 'Jeff Louis',
      'Duckens Nazon', 'Wilde-Donald Guerrier', 'Ronaldo Damus', 'James Léa Siliki',
      'Kervens Belfort', 'Rémy Duverseau', 'Bonel Élysée', 'Hervé Bazile',
      'Zachary Herivaux', 'Guy Mbenza',
    ]),
  },
  {
    code: 'SCO', name: 'Escócia', group: 'C', flagCode: 'gb-sct', primaryColor: '#0065BD',
    stickers: players([
      'Angus Gunn', 'Nathan Patterson', 'Grant Hanley', 'John Souttar',
      'Andrew Robertson', 'Scott McTominay', 'Callum McGregor', 'John McGinn',
      'Stuart Armstrong', 'Lawrence Shankland', 'Che Adams', 'Ryan Christie',
      'Scott McKenna', 'Billy Gilmour', 'Ben Doak', 'Liam Scales',
      'Kenny McLean', 'Lyndon Dykes',
    ]),
  },

  // ─── GRUPO D ────────────────────────────────────────────────────
  {
    code: 'USA', name: 'Estados Unidos', group: 'D', flagCode: 'us', primaryColor: '#002868',
    stickers: players([
      'Matt Turner', 'DeAndre Yedlin', 'Miles Robinson', 'Cameron Carter-Vickers',
      'Antonee Robinson', 'Tyler Adams', 'Weston McKennie', 'Yunus Musah',
      'Christian Pulisic', 'Josh Sargent', 'Ricardo Pepi', 'Brendan Aaronson',
      'Gio Reyna', 'Folarin Balogun', 'Tim Weah', 'Johnny Cardoso',
      'Malik Tillman', 'Jesús Ferreira',
    ]),
  },
  {
    code: 'PAR', name: 'Paraguai', group: 'D', flagCode: 'py', primaryColor: '#D52B1E',
    stickers: players([
      'Antony Silva', 'Juan Escobar', 'Gustavo Gómez', 'Fabián Balbuena',
      'Santiago Arzamendia', 'Mathías Villasanti', 'Miguel Almirón', 'Ángel Romero',
      'Julio Enciso', 'Antonio Sanabria', 'Carlos González', 'Richard Sánchez',
      'Braian Samudio', 'Junior Alonso', 'Gabriel Ávalos', 'Alejandro Romero Gamarra',
      'Iván Ramírez', 'Omar Alderete',
    ]),
  },
  {
    code: 'AUS', name: 'Austrália', group: 'D', flagCode: 'au', primaryColor: '#00843D',
    stickers: players([
      'Mathew Ryan', 'Miloš Degenek', 'Harry Souttar', 'Bailey Wright',
      'Aziz Behich', 'Aaron Mooy', 'Jackson Irvine', 'Riley McGree',
      'Matt Leckie', 'Mitchell Duke', 'Adam Taggart', 'Martin Boyle',
      'Craig Goodwin', 'Garang Kuol', 'Keanu Baccus', 'Nestory Irankunda',
      'Thomas Deng', 'Cameron Devlin',
    ]),
  },
  {
    code: 'TUR', name: 'Turquia', group: 'D', flagCode: 'tr', primaryColor: '#E30A17',
    stickers: players([
      'Uğurcan Çakır', 'Zeki Çelik', 'Merih Demiral', 'Samet Akaydin',
      'Ferdi Kadıoğlu', 'Hakan Çalhanoğlu', 'Orkun Kökçü', 'Kaan Ayhan',
      'Kerem Aktürkoğlu', 'Yılmaz Bülent', 'Cenk Tosun', 'Cengiz Ünder',
      'Arda Güler', 'Barış Alper Yılmaz', 'İrfan Can Kahveci', 'Abdülkadir Ömür',
      'Efecan Karaca', 'Semih Kılıçsoy',
    ]),
  },

  // ─── GRUPO E ────────────────────────────────────────────────────
  {
    code: 'GER', name: 'Alemanha', group: 'E', flagCode: 'de', primaryColor: '#000000',
    stickers: players([
      'Manuel Neuer', 'Joshua Kimmich', 'Antonio Rüdiger', 'Jonathan Tah',
      'Maximilian Mittelstädt', 'Robert Andrich', 'Florian Wirtz', 'Jamal Musiala',
      'Kai Havertz', 'Niclas Füllkrug', 'Leroy Sané', 'Thomas Müller',
      'Serge Gnabry', 'Pascal Groß', 'Chris Führich', 'Deniz Undav',
      'David Raum', 'Aleksandar Pavlović',
    ]),
  },
  {
    code: 'CUW', name: 'Curaçao', group: 'E', flagCode: 'cw', primaryColor: '#002B7F',
    stickers: players([
      'Eloy Room', 'Cuco Martina', 'Rangelo Janga', 'Ryan Donk',
      'Dion Malone', 'Leandro Bacuna', 'Quenten Martinus', 'Gevaro Nepomuceno',
      'Juninho', 'Gino van Kessel', 'Sheraldo Becker', 'Myron Boadu',
      'Nigel Hasselbaink', 'Cyriel Dessers', 'Elson Hooi', 'Jairon Vicario',
      'Henrico Doran', 'Cédric van der Gun',
    ]),
  },
  {
    code: 'CIV', name: 'Costa do Marfim', group: 'E', flagCode: 'ci', primaryColor: '#F77F00',
    stickers: players([
      'Badra Ali Sangaré', 'Serge Aurier', 'Eric Bailly', 'Wilfried Kanon',
      'Ghislain Konan', 'Jean-Philippe Gbamin', 'Seko Fofana', 'Franck Kessié',
      'Wilfried Zaha', 'Sébastien Haller', 'Nicolas Pépé', 'Maxwel Cornet',
      'Ibrahim Sangaré', 'Simon Adingra', 'Oumar Diakité', 'Jean Michaël Seri',
      'Willy Boly', 'Emmanuel Agbadou',
    ]),
  },
  {
    code: 'ECU', name: 'Equador', group: 'E', flagCode: 'ec', primaryColor: '#FFD100',
    stickers: players([
      'Hernán Galíndez', 'Ángelo Preciado', 'Robert Arboleda', 'Piero Hincapié',
      'Pervis Estupiñán', 'Moisés Caicedo', 'Carlos Gruezo', 'Jhegson Méndez',
      'Gonzalo Plata', 'Enner Valencia', 'Michael Estrada', 'Djorkaeff Reasco',
      'Jordy Caicedo', 'Jeremy Sarmiento', 'Kevin Minda', 'Alan Minda',
      'Xavier Arreaga', 'José Cifuentes',
    ]),
  },

  // ─── GRUPO F ────────────────────────────────────────────────────
  {
    code: 'NED', name: 'Holanda', group: 'F', flagCode: 'nl', primaryColor: '#FF6300',
    stickers: players([
      'Bart Verbruggen', 'Denzel Dumfries', 'Virgil van Dijk', 'Stefan de Vrij',
      'Nathan Aké', 'Frenkie de Jong', 'Tijjani Reijnders', 'Teun Koopmeiners',
      'Donyell Malen', 'Cody Gakpo', 'Xavi Simons', 'Wout Weghorst',
      'Ryan Gravenberch', 'Joey Veerman', 'Quinten Timber', 'Brian Brobbey',
      'Jerdy Schouten', 'Lutsharel Geertruida',
    ]),
  },
  {
    code: 'JPN', name: 'Japão', group: 'F', flagCode: 'jp', primaryColor: '#BC002D',
    stickers: players([
      'Shuichi Gonda', 'Hiroki Sakai', 'Maya Yoshida', 'Ko Itakura',
      'Yuta Nakayama', 'Wataru Endo', 'Hidemasa Morita', 'Junya Ito',
      'Ao Tanaka', 'Kaoru Mitoma', 'Takumi Minamino', 'Daichi Kamada',
      'Ritsu Doan', 'Ayase Ueda', 'Takehiro Tomiyasu', 'Yukinari Sugawara',
      'Keito Nakamura', 'Koji Miyoshi',
    ]),
  },
  {
    code: 'SWE', name: 'Suécia', group: 'F', flagCode: 'se', primaryColor: '#006AA7',
    stickers: players([
      'Robin Olsen', 'Mikael Lustig', 'Victor Nilsson Lindelöf', 'Marcus Danielson',
      'Ludwig Augustinsson', 'Albin Ekdal', 'Emil Forsberg', 'Dejan Kulusevski',
      'Alexander Isak', 'Viktor Gyökeres', 'Zlatan Ibrahimović', 'Mattias Svanberg',
      'Ken Sema', 'Samuel Gustafson', 'Jesper Karlsson', 'Anthony Elanga',
      'Kristoffer Olsson', 'Benjamin Nygren',
    ]),
  },
  {
    code: 'TUN', name: 'Tunísia', group: 'F', flagCode: 'tn', primaryColor: '#E70013',
    stickers: players([
      'Bechir Ben Said', 'Mohamed Drager', 'Yassine Meriah', 'Nader Ghandri',
      'Ali Maaloul', 'Aïssa Laïdouni', 'Ellyes Skhiri', 'Hannibal Mejbri',
      'Naim Sliti', 'Issam Jebali', 'Seifeddine Jaziri', 'Wahbi Khazri',
      'Bilel Ifa', 'Montassar Talbi', 'Mohamed Ali Ben Romdhane', 'Ferjani Sassi',
      'Yohan Benalouane', 'Dylan Bronn',
    ]),
  },

  // ─── GRUPO G ────────────────────────────────────────────────────
  {
    code: 'BEL', name: 'Bélgica', group: 'G', flagCode: 'be', primaryColor: '#EF3340',
    stickers: players([
      'Thibaut Courtois', 'Thomas Meunier', 'Jan Vertonghen', 'Wout Faes',
      'Yannick Carrasco', 'Kevin De Bruyne', 'Youri Tielemans', 'Amadou Onana',
      'Eden Hazard', 'Romelu Lukaku', 'Dries Mertens', 'Alexis Saelemaekers',
      'Leandro Trossard', 'Loïs Openda', 'Arthur Vermeeren', 'Charles De Ketelaere',
      'Orel Mangala', 'Julián Baumgartlinger',
    ]),
  },
  {
    code: 'EGY', name: 'Egito', group: 'G', flagCode: 'eg', primaryColor: '#CE1126',
    stickers: players([
      'Mohamed El-Shenawy', 'Ahmed Hegazy', 'Omar Kamal', 'Ayman Ashraf',
      'Mohamed Abdel-Moneim', 'Mohamed Elneny', 'Tarek Hamed', 'Amr El Sulaya',
      'Mohamed Salah', 'Marwan Hamdy', 'Omar Marmoush', 'Mostafa Mohamed',
      'Zizo', 'Mahmoud Trezeguet', 'Ahmed Sayed Zizo', 'Ramadan Sobhi',
      'Hussein El-Shahat', 'Kahraba',
    ]),
  },
  {
    code: 'IRN', name: 'Irã', group: 'G', flagCode: 'ir', primaryColor: '#239F40',
    stickers: players([
      'Alireza Beiranvand', 'Sadegh Moharrami', 'Majid Hosseini', 'Shoja Khalilzadeh',
      'Ehsan Hajsafi', 'Saeid Ezatolahi', 'Ahmad Noorollahi', 'Ali Gholizadeh',
      'Mehdi Taremi', 'Sardar Azmoun', 'Karim Ansarifard', 'Milad Mohammadi',
      'Roozbeh Cheshmi', 'Morteza Pouraliganji', 'Allahyar Sayyadmanesh', 'Saman Ghoddos',
      'Omid Noorafkan', 'Mohammad Mohebbi',
    ]),
  },
  {
    code: 'NZL', name: 'Nova Zelândia', group: 'G', flagCode: 'nz', primaryColor: '#00247D',
    stickers: players([
      'Stefan Marinovic', 'Liberato Cacace', 'Winston Reid', 'Michael Boxall',
      'Tim Payne', 'Joe Bell', 'Marco Rojas', 'Elijah Just',
      'Chris Wood', 'Myer Bevan', 'Matthew Garbett', 'Callum McCowatt',
      'Clayton Lewis', 'Storm Roux', 'Nando Pijnaker', 'Kosta Barbarouses',
      'Bill Tuilagi', 'Zac McGraw',
    ]),
  },

  // ─── GRUPO H ────────────────────────────────────────────────────
  {
    code: 'ESP', name: 'Espanha', group: 'H', flagCode: 'es', primaryColor: '#AA151B',
    stickers: players([
      'Unai Simón', 'Dani Carvajal', 'Robin Le Normand', 'Aymeric Laporte',
      'Marc Cucurella', 'Rodri', 'Pedri', 'Gavi',
      'Lamine Yamal', 'Álvaro Morata', 'Nico Williams', 'Ferran Torres',
      'Dani Olmo', 'Mikel Merino', 'Fabián Ruiz', 'Martín Zubimendi',
      'Alejandro Grimaldo', 'Álex Baena',
    ]),
  },
  {
    code: 'CPV', name: 'Cabo Verde', group: 'H', flagCode: 'cv', primaryColor: '#003893',
    stickers: players([
      'Vozinha', 'Stopira', 'Roberto Lopes', 'Fali Candé',
      'Diney', 'Patrick Andrade', 'Ryan Mendes', 'Garry Rodrigues',
      'Nanu', 'Carlos Fortes', 'Djaniny', 'Kenny Rocha',
      'Alexandre Semedo', 'Jamiro Monteiro', 'Arnold Issoko', 'Lisandro',
      'Ulisses Fernandes', 'Pity',
    ]),
  },
  {
    code: 'KSA', name: 'Arábia Saudita', group: 'H', flagCode: 'sa', primaryColor: '#006C35',
    stickers: players([
      'Mohammed Al-Owais', 'Saud Abdulhamid', 'Ali Al-Bulaihi', 'Hassan Tambakti',
      'Yasir Al-Shahrani', 'Ali Al-Hassan', 'Abdulelah Al-Malki', 'Sami Al-Najei',
      'Salem Al-Dawsari', 'Firas Al-Buraikan', 'Abdullah Al-Hamdan', 'Hattan Bahebri',
      'Nasser Al-Dawsari', 'Mohammed Al-Buraik', 'Sultan Al-Ghannam', 'Riyadh Sharahili',
      'Yasser Al-Shahrani', 'Mohammed Al-Qasem',
    ]),
  },
  {
    code: 'URU', name: 'Uruguai', group: 'H', flagCode: 'uy', primaryColor: '#5EB6E4',
    stickers: players([
      'Sergio Rochet', 'Guillermo Varela', 'José María Giménez', 'Ronald Araújo',
      'Mathías Olivera', 'Rodrigo Bentancur', 'Matías Vecino', 'Nicolás de la Cruz',
      'Federico Valverde', 'Darwin Núñez', 'Luis Suárez', 'Facundo Pellistri',
      'Brian Rodríguez', 'Nahitan Nández', 'Agustín Canobbio', 'Matías Viña',
      'Franco Armani', 'Giorgian de Arrascaeta',
    ]),
  },

  // ─── GRUPO I ────────────────────────────────────────────────────
  {
    code: 'FRA', name: 'França', group: 'I', flagCode: 'fr', primaryColor: '#002395',
    stickers: players([
      'Mike Maignan', 'Jules Koundé', 'William Saliba', 'Dayot Upamecano',
      'Theo Hernandez', 'N\'Golo Kanté', 'Aurélien Tchouaméni', 'Eduardo Camavinga',
      'Ousmane Dembélé', 'Kylian Mbappé', 'Antoine Griezmann', 'Marcus Thuram',
      'Randal Kolo Muani', 'Warren Zaïre-Emery', 'Bradley Barcola', 'Rayan Cherki',
      'Matteo Guendouzi', 'Michael Olise',
    ]),
  },
  {
    code: 'SEN', name: 'Senegal', group: 'I', flagCode: 'sn', primaryColor: '#00853F',
    stickers: players([
      'Édouard Mendy', 'Youssouf Sabaly', 'Kalidou Koulibaly', 'Abdou Diallo',
      'Fodé Ballo-Touré', 'Cheikhou Kouyaté', 'Idrissa Gueye', 'Pape Matar Sarr',
      'Ismaïla Sarr', 'Sadio Mané', 'Boulaye Dia', 'Habib Diallo',
      'Nicolas Jackson', 'Iliman Ndiaye', 'Lamine Camara', 'Nampalys Mendy',
      'Formose Mendy', 'Pape Abdou Cissé',
    ]),
  },
  {
    code: 'IRQ', name: 'Iraque', group: 'I', flagCode: 'iq', primaryColor: '#CE1126',
    stickers: players([
      'Jalal Hassan', 'Ali Adnan', 'Ahmed Ibrahim', 'Rebin Sulaka',
      'Yaser Kasim', 'Mohanad Ali', 'Amjad Attwan', 'Aymen Hussein',
      'Amir Al-Ammari', 'Humam Tariq', 'Bashar Resan', 'Safaa Hadi',
      'Mahdi Kamil', 'Ahmed Yasin', 'Omar Khribit', 'Alaa Abbas',
      'Saad Natiq', 'Zaid Hamash',
    ]),
  },
  {
    code: 'NOR', name: 'Noruega', group: 'I', flagCode: 'no', primaryColor: '#EF2B2D',
    stickers: players([
      'Ørjan Nyland', 'Julian Ryerson', 'Leo Østigård', 'Andreas Christensen',
      'Birger Meling', 'Mathias Normann', 'Sander Berge', 'Martin Ødegaard',
      'Erling Haaland', 'Alexander Sørloth', 'Antonio Nusa', 'Mohamed Elyounoussi',
      'Ole Selnæs', 'Jostein Gundersen', 'Kristian Thorstvedt', 'Kjetil Haug',
      'Fredrik Aursnes', 'Jens Petter Hauge',
    ]),
  },

  // ─── GRUPO J ────────────────────────────────────────────────────
  {
    code: 'ARG', name: 'Argentina', group: 'J', flagCode: 'ar', primaryColor: '#74ACDF',
    stickers: players([
      'Emiliano Martínez', 'Nahuel Molina', 'Cristian Romero', 'Nicolás Otamendi',
      'Marcos Acuña', 'Rodrigo De Paul', 'Alexis Mac Allister', 'Enzo Fernández',
      'Ángel Di María', 'Lionel Messi', 'Lautaro Martínez', 'Julián Álvarez',
      'Alejandro Garnacho', 'Nicolás González', 'Valentín Carboni', 'Germán Pezzella',
      'Thiago Almada', 'Franco Mastantuono',
    ]),
  },
  {
    code: 'ALG', name: 'Argélia', group: 'J', flagCode: 'dz', primaryColor: '#006233',
    stickers: players([
      'Raïs M\'Bolhi', 'Ramy Bensebaini', 'Djamel Benlamri', 'Aissa Mandi',
      'Hossem Aouar', 'Sofiane Feghouli', 'Ismaël Bennacer', 'Youcef Belaïli',
      'Riyad Mahrez', 'Islam Slimani', 'Baghdad Bounedjah', 'Yacine Brahimi',
      'Mehdi Zerkane', 'Adam Ounas', 'Zinedine Ferhat', 'Dali Benchebira',
      'Abdelkader Bedrane', 'Said Benrahma',
    ]),
  },
  {
    code: 'AUT', name: 'Áustria', group: 'J', flagCode: 'at', primaryColor: '#ED2939',
    stickers: players([
      'Patrick Pentz', 'Stefan Lainer', 'Aleksandar Dragovic', 'David Alaba',
      'Philipp Mwene', 'Konrad Laimer', 'Nicolas Seiwald', 'Marcel Sabitzer',
      'Christoph Baumgartner', 'Michael Gregoritsch', 'Marko Arnautovic', 'Florian Kainz',
      'Valentino Lazaro', 'Xaver Schlager', 'Romano Schmid', 'Patrick Wimmer',
      'Moritz Wöber', 'Louis Schaub',
    ]),
  },
  {
    code: 'JOR', name: 'Jordânia', group: 'J', flagCode: 'jo', primaryColor: '#007A3D',
    stickers: players([
      'Yazeed Abulaila', 'Baha Faisal', 'Khaled Awn', 'Raed Sabbah',
      'Abdullah Nasib', 'Musa Al-Taamari', 'Yazan Naimat', 'Zaid Al-Deek',
      'Ahmad Hayel', 'Hamza Igbariah', 'Khaled Al-Sahouri', 'Moussa Tomah',
      'Salem Al-Amr', 'Mohammed Al-Maayta', 'Omar Khalil', 'Khalid Bani Attiah',
      'Youssef Al-Zubi', 'Mohammad Bani Yaseen',
    ]),
  },

  // ─── GRUPO K ────────────────────────────────────────────────────
  {
    code: 'POR', name: 'Portugal', group: 'K', flagCode: 'pt', primaryColor: '#006600',
    stickers: players([
      'Rui Patrício', 'João Cancelo', 'Rúben Dias', 'Danilo Pereira',
      'Nuno Mendes', 'João Palhinha', 'Rúben Neves', 'Vitinha',
      'Bernardo Silva', 'Bruno Fernandes', 'Cristiano Ronaldo', 'Rafael Leão',
      'Pedro Neto', 'Diogo Jota', 'João Félix', 'Gonçalo Inácio',
      'Gonçalo Ramos', 'Francisco Conceição',
    ]),
  },
  {
    code: 'COD', name: 'Congo', group: 'K', flagCode: 'cd', primaryColor: '#007FFF',
    stickers: players([
      'Joël Kiassumbua', 'Chancel Mbemba', 'Marcel Tisserand', 'Arthur Masuaku',
      'Théo Bongonda', 'Jonathan Bolingi', 'Gaël Kakuta', 'Paul-José M\'Poku',
      'Cédric Bakambu', 'Yoane Wissa', 'Yannick Bolasie', 'Jordan Botaka',
      'Dieumerci Ndongala', 'Silas Mvumpa', 'Héritier Luvumbu', 'Britt Assombalonga',
      'Christian Luyindama', 'Youssouf Mulumbu',
    ]),
  },
  {
    code: 'UZB', name: 'Uzbequistão', group: 'K', flagCode: 'uz', primaryColor: '#1EB53A',
    stickers: players([
      'Otabek Shukurov', 'Khurshid Beknazarov', 'Sanjar Tursunov', 'Islom Tukhtakhujaev',
      'Husain Norchaev', 'Dostonbek Khamdamov', 'Jaloliddin Masharipov', 'Otabek Djuraev',
      'Eldor Shomurodov', 'Jasur Yaxshiboyev', 'Bobir Abdixoliqov', 'Rustam Qosimov',
      'Temur Juraev', 'Sherzod Qodirov', 'Utkir Yusupov', 'Jamshid Iskanderov',
      'Shokir Hamrobekov', 'Oston Urunov',
    ]),
  },
  {
    code: 'COL', name: 'Colômbia', group: 'K', flagCode: 'co', primaryColor: '#FCD116',
    stickers: players([
      'David Ospina', 'Daniel Muñoz', 'Dávinson Sánchez', 'Yerry Mina',
      'Johan Mojica', 'Jefferson Lerma', 'Wilmar Barrios', 'James Rodríguez',
      'Luis Díaz', 'Rafael Santos Borré', 'Jhon Jáder Durán', 'Matheus Uribe',
      'Cuadrado', 'Daniel Ruiz', 'Richard Ríos', 'Sebastián Gómez',
      'Jhon Córdoba', 'Camilo Vargas',
    ]),
  },

  // ─── GRUPO L ────────────────────────────────────────────────────
  {
    code: 'ENG', name: 'Inglaterra', group: 'L', flagCode: 'gb-eng', primaryColor: '#CF142B',
    stickers: players([
      'Jordan Pickford', 'Trent Alexander-Arnold', 'John Stones', 'Marc Guehi',
      'Kieran Trippier', 'Declan Rice', 'Jude Bellingham', 'Phil Foden',
      'Bukayo Saka', 'Harry Kane', 'Cole Palmer', 'Marcus Rashford',
      'Ollie Watkins', 'Anthony Gordon', 'Eberechi Eze', 'Morgan Gibbs-White',
      'Levi Colwill', 'Noni Madueke',
    ]),
  },
  {
    code: 'CRO', name: 'Croácia', group: 'L', flagCode: 'hr', primaryColor: '#FF0000',
    stickers: players([
      'Dominik Livaković', 'Josip Juranović', 'Domagoj Vida', 'Joško Gvardiol',
      'Borna Sosa', 'Mateo Kovačić', 'Luka Modrić', 'Marcelo Brozović',
      'Ivan Perišić', 'Andrej Kramarić', 'Bruno Petković', 'Nikola Vlašić',
      'Mislav Oršić', 'Ante Budimir', 'Luka Ivanušec', 'Martin Erlić',
      'Šime Vrsaljko', 'Ante Rebić',
    ]),
  },
  {
    code: 'GHA', name: 'Gana', group: 'L', flagCode: 'gh', primaryColor: '#006B3F',
    stickers: players([
      'Joseph Wollacott', 'Andrew Ayew', 'Daniel Amartey', 'Alexander Djiku',
      'Baba Rahman', 'Thomas Partey', 'Iddrisu Baba', 'Mohammed Kudus',
      'Jordan Ayew', 'Inaki Williams', 'Antoine Semenyo', 'Kamaldeen Sulemana',
      'Osman Bukari', 'Richmond Boakye', 'Tariq Lamptey', 'Fatawu Issahaku',
      'Abdul Fatawu', 'Felix Afena-Gyan',
    ]),
  },
  {
    code: 'PAN', name: 'Panamá', group: 'L', flagCode: 'pa', primaryColor: '#DA121A',
    stickers: players([
      'Luis Mejía', 'Eric Davis', 'Fidel Escobar', 'Harold Cummings',
      'Andrés Andrade', 'Aníbal Godoy', 'Adalberto Carrasquilla', 'José Fajardo',
      'Alberto Quintero', 'Rolando Blackburn', 'Ismael Díaz', 'César Yanis',
      'Azmahar Ariano', 'Michael Amir Murillo', 'Iván Anderson', 'Edgar Bárcenas',
      'Abdiel Ayarza', 'Freddy Góndola',
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
