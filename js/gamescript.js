const SCALE = 2;

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Object {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;

		this.width = SCALE * width;
		this.height = SCALE * height;
		
		this.dx = 0;
		this.dy = 0;
		this.isNeed = true;

		this.timelive = 0;
		this.tag = '';

		if (this.y <= ENEMY_STARTY) {
			this.tag = 'enemy';
		}
	}
	Move() {
		this.x += this.dx;
		this.y += this.dy;
		if (this.y < -200) {
			this.isNeed = false;
		}
		if (this.y > canvas.height + 100) {
			this.isNeed = false;
		}
	}
	static Intersect(self, borders) {
		if (self.x >= borders.x && self.x <= borders.x + borders.width && self.y >= borders.y && self.y <= borders.y + borders.height) {
			return true;
		}	return false;
	}
}

class Bullet extends Object { 
	constructor(x, y, width, height) {
		super(x, y, width, height);
		
		this.speed = BULLET_SPEED;

		this.Texture2D = new Image();
		this.Texture2D.src = "images/bullet.png";
		
		this.dy = -this.speed;
	}
	Move() {
		super.Move();
		for (let i = 0; i < MyEngine.enemies.length; i++) {
			let current = MyEngine.enemies[i];
			if (Object.Intersect(new Point(this.x, this.y), current) || 
				Object.Intersect(new Point(this.x + this.width, this.y), current) || 
				Object.Intersect(new Point(this.x, this.y + this.height), current) || 
				Object.Intersect(new Point(this.x + this.width, this.y + this.height), current)) {
					if (current.health >= 0) {
						this.isNeed = false;
						current.doDamage(MyGun.damage, this.x + this.width / 2);
					}
				}
		}
	}
}

class Sleeve extends Object {
	timetolive = SLEEVE_TIMETOLIVE;
	continuetomove = SLEEVE_CONTINUETOMOVE;
	spreadX = SLEEVE_SPREADX;
	spreadY = SLEEVE_SPREADY;
	constructor(x, y, width, height) {
		super(x, y, width, height);

		this.speedY = Math.random() * this.spreadY * 2 - this.spreadY;
		this.speedX = Math.random() * this.spreadX;
		this.Texture2D = new Image();
		this.Texture2D.src = 'images/bullet.png';

		this.dx = -this.speedX;
		this.dy = this.speedY;
	}	
	Move() {
		this.x += this.dx;
		this.y += this.dy;

		this.width = this.width * this.continuetomove;
		this.height = this.height * this.continuetomove;

		if (this.timelive > this.timetolive) {
			this.isNeed = false;
		}
	}
}

class Cloud extends Sleeve {
	timetolive = CLOUD_TIMETOLIVE;
	continuetomove = CLOUD_CONTINUETOMOVE;
	continuetogrow = CLOUD_CONTINUETOGROW;
	spreadX = CLOUD_SPREADX;
	spreadY = CLOUD_SPREADY;
	constructor(x, y, width, height) {
		super(x, y, width, height);

		///this.speedY = Math.random() * this.spreadY * 2 - this.spreadY;
		///this.speedX = Math.random() * this.spreadX * 2 - this.spreadX;

		this.Texture2D.src = 'images/smog.png';

		this.dx = -this.speedX;
		this.dy = this.speedY;
	}
	Move() {
		this.x += this.dx;
		this.y += this.dy;

		this.dx = this.dx * this.continuetomove;
		this.dy = this.dy * this.continuetomove;

		if (this.timelive > this.timetolive) {
			this.isNeed = false;
		}

		this.width *= (1 / this.continuetogrow);
		this.height *= (1 / this.continuetogrow);
	}
}

class Star extends Cloud {

	timetolive = STAR_TIMETOLIVE;
	continuetomove = STAR_CONTINUETOMOVE;
	continuetogrow = STAR_CONTINUETOGROW;
	spreadX = STAR_SPREADX;
	spreadY = STAR_SPREADY;

	constructor(x, y, width, height) {
		super(x, y, width, height);

		this.Texture2D.src = 'images/star.png';

		this.dx = this.speedX;
		this.dy = this.speedY;
	}
	Move() {
		super.Move();

		this.dy = Math.random() * this.spreadY;
	}
}

class Star1 extends Star {
	constructor(x, y, width, height) {
		super(x, y, width, height);
		this.Texture2D.src = 'images/star1.png';
	}
}

class Star2 extends Star {
	constructor(x, y, width, height) {
		super(x, y, width, height);
		this.Texture2D.src = 'images/star2.png';
	}
}

class Element {
	constructor (text, size, color) {
		this.text = text;
		this.size = size;
		this.color = color;
	}
}

class Menu extends Object {
	
	content = [];
	status = 1;

	constructor(x, y, width, height) {
		super(x, y, width, height);

		this.Texture2D = new Image();
		this.Texture2D.src = 'images/menu.png';
		this.money = STARTMONEY;
	}
	AddMoney(count) {
		this.money += count;
	}
	TakeMoney(count) {
		if (this.money >= count) {
			this.money -= count;
			return true;
		} 	return false;
	}
	SetValues() {
		this.content[0] = new Element(this.money + '$', 25, '#3c3');

		this.content[1] = new Element('', 15, '#eee');
		
		this.content[2] = new Element('Магазин', 20, '#99f');
		this.content[3] = new Element(SPACE + MyGun.damagecost + '$ - увеличить урон (Q, ' + MyGun.damage.toFixed(1) + ')', 15, '#eee');
		this.content[4] = new Element(SPACE + MyGun.needdelaycost + '$ - уменьшить задержку (W, ' + MyGun.needdelay.toFixed(1) + ')', 15, '#eee');
		this.content[5] = new Element(SPACE + MyGun.needpretimecost + '$ - уменьшить раскрутку (E, ' + MyGun.needpretime.toFixed(1) + ')', 15, '#eee');
		this.content[6] = new Element(SPACE + MyGun.vibrationcost + '$ - уменьшить отдачу (R, ' + MyGun.vibration.toFixed(1) + ')', 15, '#eee');
		this.content[7] = new Element(SPACE + MyGun.kickbackcost + '$ - увеличить толчок (T, ' + MyGun.kickback.toFixed(1) + ')', 15, '#eee');
		this.content[8] = new Element(SPACE + MyGun.maxholdtimecost + '$ - уменьшить перегрев (Y, ' + MyGun.maxholdtime.toFixed(1) + ')', 15, '#eee');
		this.content[9] = new Element(SPACE + MyGun.slowercost + '$ - увеличить замедление (U, ' + MyGun.slower.toFixed(1) + ')', 15, '#eee');

		this.content[10] = new Element('', 15, '#eee');
		
		this.content[11] = new Element('Управление', 20, '#99f');
		this.content[12] = new Element(SPACE + 'Огонь - ЛКМ', 15, '#eee');
		this.content[13] = new Element(SPACE + 'Передвижение - мышь', 15, '#eee');
		this.content[14] = new Element(SPACE + 'Пауза - ESCAPE', 15, '#eee');

		this.content[15] = new Element('', 15, '#eee');
		
		this.content[16] = new Element('Статистика', 20, '#99f');
		this.content[17] = new Element(SPACE + 'Убито врагов: ' + MyWave.killall, 15, '#eee');
		this.content[18] = new Element(SPACE + 'Текущая волна: ' + MyWave.curwave, 15, '#eee');
		
		this.content[19] = new Element('', 15, '#eee');

		if (this.status == 0) {
			this.content[20] = new Element('К сожалению, вы проиграли :(', 20, '#f00');
		} 
		if (this.status == 1) {
			this.content[20] = new Element('Пауза (Нажмите ESC)', 20, '#f00');
		}
		if (this.status == 2) {
			this.content[20] = new Element('', 20, '#eee');
		}

		this.content[21] = new Element('', 15, '#eee');
		this.content[22] = new Element('SorryGames :)', 20, '#99f');
	}
	Move() {
		this.SetValues();

		this.cury = canvas.height / 5;
		for (let i = 0; i < this.content.length; i++) {
			context.font = this.content[i].size + "px Arial";
			context.fillStyle = this.content[i].color;
			context.fillText(this.content[i].text, this.x + this.width / 7, this.cury);
			this.cury += 20;		
		}
	}
}

class Enemy extends Object {
	constructor(x, y, width, height) {
		super(x, y, width, height);
		
		this.Texture2D = new Image();
		this.Texture2D.src = 'images/ufo.png';

		this.speedX = ENEMY_SPEEDX;
		this.speedY = ENEMY_SPEEDY;
		this.health = ENEMY_HEALTH;


		this.dx = this.speedX;
		this.dy = this.speedY;

		this.x = Math.random() * (canvas.width - this.width);
		this.delay = 0;
	}
	Move() {
		this.x += this.dx;
		this.y += this.dy;

		if (this.x > canvas.width - this.width - MENU_WIDTH) {
			this.x = canvas.width - this.width - MENU_WIDTH;
			this.dx = -1;
		}
		if (this.x < 0) {
			this.x = 0;
			this.dx = 1;
		}

		if (this.health <= 0) {
			this.width *= (1 / ENEMY_CONTINUETOGROW);
			this.height *= (1 / ENEMY_CONTINUETOGROW);
			MyEngine.objects.push(new Star(this.x + Math.random() * this.width, this.y + Math.random() * this.height, STAR_WIDTH, STAR_HEIGHT));
			MyEngine.objects.push(new Star1(this.x + Math.random() * this.width, this.y + Math.random() * this.height, STAR_WIDTH, STAR_HEIGHT));
			MyEngine.objects.push(new Star2(this.x + Math.random() * this.width, this.y + Math.random() * this.height, STAR_WIDTH, STAR_HEIGHT));	
		
		}
		if (this.width <= 10) {

			///ENEMY KILLED
			this.isNeed = false;
			MyMenu.AddMoney(100 + Math.floor(Math.random() * 30));
			MyWave.current_count_enemies--;
			MyWave.addkill();
		}

		if (this.y > canvas.height) {
			MyMenu.status = 0;
		}

		this.dx += Math.random() * this.speedX * 2 - this.speedX;
	}
	doDamage(damage, stateX) {
		MyEngine.objects.push(new Star(stateX, this.y + this.height / 1.5, STAR_WIDTH, STAR_HEIGHT));
		this.y -= MyGun.kickback;
		if (this.dx > 0) {
			this.dx = Math.max(this.dx - MyGun.slower, 0);
		} else {
			this.dx = Math.min(this.dx + MyGun.slower, 0);
		}
		this.health -= damage;
	}
	JoinToGame() {
		MyEngine.objects.push(this);
		MyEngine.enemies.push(this);
	}
}


class Gun extends Object {

	slower = MINIGUN_SLOWER;
	needpretime = MINIGUN_NEEDPRETIME;
	needdelay = MINIGUN_NEEDDELAY;
	vibration = MINIGUN_VIBRATION;
	kickback = MINIGUN_KICKBACK;
	damage = MINIGUN_DAMAGE;
	maxholdtime = MINIGUN_MAXHOLDTIME;

	slowercost = 100;
	needpretimecost = 100;
	needdelaycost = 100;
	vibrationcost = 100;
	kickbackcost = 100;
	damagecost = 100;
	maxholdtimecost = 100;

	name1 = 'images/machine-gun.png';
	name2 = 'images/machine-gun2.png';
	constructor(x, y, width, height) {
		super(x, y, width, height);

		this.Texture2D = new Image();
		this.Texture2D.src = this.name1;
		
		this.flag = 1;
		this.delay = 0;
		this.pretime = 0;
		this.clickfire = false;
		this.canfire = true;
		this.timelive = LIVE_FOREVER;
		this.holdtime = 0;
	}
	Move() {

	}
	ShowEffect() {
		if (this.pretime > 0 && this.delay == this.needdelay) {
			if (this.flag == 1) {
				this.Texture2D.src = this.name2;
				this.flag = 2;			
			} else {
				this.Texture2D.src = this.name1;
				this.flag = 1;
			}
		}

		if (this.canfire && this.pretime == this.needpretime) {
			this.dx += Math.random() * this.vibration * 2 - this.vibration;
			this.dy += Math.random() * this.vibration * 2 - this.vibration;
			if (this.dx > this.vibration) {
				this.dx = this.vibration;
			}
			if (this.dy > this.vibration) {
				this.dy = this.vibration;
			}
			if (this.dx < -this.vibration) {
				this.dx = -this.vibration;
			}
			if (this.dy < -this.vibration) {
				this.dy = -this.vibration;
			}
		}
	}
}

class Wave {
	strength = 1;
	current_count_enemies = 0;
	killall = 0;
	curwave = 0;
	RequestForWave() {
		if (this.current_count_enemies == 0) {
			let start_value = ENEMY_STARTY
			this.curwave++;

			this.current_count_enemies = this.strength;
			for (let i = 0; i < this.strength; i++) {
				(new Enemy(0, start_value, ENEMY_WIDTH, ENEMY_HEIGHT)).JoinToGame();	
				start_value -= Math.random() * DISTANCE;
			}

			this.strength = Math.floor(this.strength * IMPROVE);
			this.strength = Math.max(this.strength + 1, 2);

		}
	}
	addkill() {
		this.killall++;
	}
}

class Engine {
	objects = [];
	newobjects = [];
	enemies = [];

	isGame = false;

	constructor() {

	}

	ShowFPS() {
		this.FPS = (this.end_time - this.start_time) / 1000; 
		this.FPS = 1 / this.FPS;
		context.font = "15px Arial";
		context.fillStyle = "#f90";
		context.fillText("FPS: " + Math.min(120, (this.FPS).toFixed(0)), 5, 15);
	}

	Update(self) {
		self.start_time = performance.now();

		context.drawImage(MyBackground, 0, 0, canvas.width - MENU_WIDTH, canvas.height);
		context.drawImage(MyBackground2, canvas.width - MENU_WIDTH, 0, MENU_WIDTH, canvas.height);
	
		if (self.isGame) {

			///Calculate Frame

			///LOAD BACKGROUND
			//context.clearRect(0, 0, canvas.width, canvas.height);

			self.newobjects = self.objects.slice();
			self.objects.length = 0;
			self.enemies.length = 0;

			for (let i = 0; i < self.newobjects.length; i++) {
				let render = self.newobjects[i];
				if (render.isNeed && render.tag == 'enemy') {
					self.enemies.push(render);
				}
			}

			for (let i = self.newobjects.length-1; i >= 0; i--) {
				let render = self.newobjects[i];

				if (render.isNeed) {
					context.drawImage(render.Texture2D, render.x, render.y, render.width, render.height);
					if (render.timelive != LIVE_FOREVER) {
						render.timelive++;
					}
					render.Move();
					self.objects.push(render);
				}
			}

			MyWave.RequestForWave();
			MyGun.ShowEffect();

			if (MyGun.delay < MyGun.needdelay) { 
				MyGun.delay++;
			} else {
				MyGun.delay = 0;
			}

			// if (MyGun.delay % 10000) {
			// 	(new Enemy(0, ENEMY_STARTY, ENEMY_WIDTH, ENEMY_HEIGHT)).JoinToGame();
			// }

			if (MyGun.clickfire && MyGun.canfire) {
				if (MyGun.delay == MyGun.needdelay && MyGun.pretime == MyGun.needpretime) {
					self.objects.push(new Bullet(MyGun.x + MyGun.width / 2 + Math.random() * MyGun.vibration * 2 - MyGun.vibration, MyGun.y - BULLET_HEIGHT, BULLET_WIDTH, BULLET_HEIGHT, BULLET_SPEED));
					self.objects.push(new Sleeve(MyGun.x, MyGun.y + MyGun.height / 2, SLEEVE_WIDTH, SLEEVE_HEIGHT));
					MyGun.holdtime++;
				}
				if (MyGun.holdtime == MyGun.maxholdtime) {
					MyGun.canfire = false;
					MyGun.holdtime *= 5;
				}
				if (MyGun.pretime < MyGun.needpretime) {
					MyGun.pretime++;
				}
			} else {
				if (MyGun.pretime > 0) {
					MyGun.pretime--;
				}
				if (MyGun.holdtime > 0) {
					if (MyGun.canfire) {
						MyGun.holdtime = Math.min(100, MyGun.holdtime);
					}
					MyGun.holdtime--;
					if (MyGun.delay % 5 == 0) {
						self.objects.push(new Cloud(MyGun.x, MyGun.y + MyGun.height / 2, CLOUD_WIDTH, CLOUD_HEIGHT));
					}
				} else {
					MyGun.canfire = true;
				}
			}
		}

		///End
		
		context.drawImage(MyMenu.Texture2D, MyMenu.x, MyMenu.y, MyMenu.width, MyMenu.height);
		MyMenu.Move();

		self.end_time = performance.now();
		self.ShowFPS();
	}	
}

function Init() {
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;

	MyMenu = new Menu(canvas.width - MENU_WIDTH, 0, MENU_WIDTH / SCALE, canvas.height / SCALE);
	MyWave = new Wave();

	if (canvas.getContext) {
		setInterval(MyEngine.Update, 1, MyEngine);
	}
}

function OnKeyDown(e) {
	if (e.keyCode == 27) {
		///Escape
		MyEngine.isGame = !MyEngine.isGame;

		if (MyMenu.status == 2) {
			MyMenu.status = 1;
		} else 
		if (MyMenu.status == 1) {
			MyMenu.status = 2;
		}
	}
	if (e.keyCode == 81) {
		///Q
		if (MyMenu.TakeMoney(MyGun.damagecost) && MyGun.damage < 100) {
			MyGun.damage += DAMAGE;
			MyGun.damagecost += IMPROVECOST;
		}
	}
	if (e.keyCode == 87) {
		///W
		if (MyMenu.TakeMoney(MyGun.needdelaycost) && MyGun.needdelay+NEEDDELAY > 1) {
			MyGun.needdelay += NEEDDELAY;
			MyGun.needdelaycost += IMPROVECOST;
		}
	}
	if (e.keyCode == 69) {
		///E
		if (MyMenu.TakeMoney(MyGun.needpretimecost) && MyGun.needpretime+NEEDPRETIME > 1) {
			MyGun.needpretime += NEEDPRETIME;
			MyGun.needpretimecost += IMPROVECOST;
		}
	}
	if (e.keyCode == 82) {
		///R
		if (MyMenu.TakeMoney(MyGun.vibrationcost) && MyGun.vibration+VIBRATION > 0) {
			MyGun.vibration += VIBRATION;
			MyGun.vibrationcost += IMPROVECOST;
		}
	}
	if (e.keyCode == 84) {
		///T
		if (MyMenu.TakeMoney(MyGun.kickbackcost) && MyGun.kickback+KICKBACK < 10) {
			MyGun.kickback += KICKBACK;
			MyGun.kickbackcost += IMPROVECOST;
		}
	}
	if (e.keyCode == 89) {
		///Y
		if (MyMenu.TakeMoney(MyGun.maxholdtimecost) && MyGun.maxholdtime+MAXHOLDTIME < 100000) {
			MyGun.maxholdtime += MAXHOLDTIME;
			MyGun.maxholdtimecost += IMPROVECOST;
		}
	}
	if (e.keyCode == 85) {
		///U
		if (MyMenu.TakeMoney(MyGun.slowercost) && MyGun.slower+SLOWER < 100) {
			MyGun.slower += SLOWER;
			MyGun.slowercost += IMPROVECOST;
		}
	}
	// alert(e.keyCode);
}

function OnMouseMove(e) {
	MyGun.x = MyGun.dx + window.event.clientX;
	MyGun.y = MyGun.dy + window.event.clientY; 

	if (MyGun.x > (canvas.width - MENU_WIDTH - MyGun.width)) {
		MyGun.x = (canvas.width - MENU_WIDTH - MyGun.width);
	}
}

function OnMouseDown(e) {
	MyGun.clickfire = true;
}

function OnMouseUp(e) {
	MyGun.clickfire = false;
}

///PREFERED SIZES______________________________________________________________________!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const LIVE_FOREVER = -1;
const DISTANCE = 40;
const IMPROVE = 1.2;
const IMPROVECOST = 25;
const STARTMONEY = 0;
const SPACE = '    ';

///Bullet 
const BULLET_WIDTH = 5; 
const BULLET_HEIGHT = 25;
const BULLET_SPEED = 10;

///Minigun
const MINIGUN_WIDTH = 20;
const MINIGUN_HEIGHT = 65;
const MINIGUN_VIBRATION = 5;
const MINIGUN_DAMAGE = 5;
const MINIGUN_NEEDPRETIME = 200;
const MINIGUN_NEEDDELAY = 50;
const MINIGUN_MAXHOLDTIME = 100;
const MINIGUN_KICKBACK = 0;
const MINIGUN_SLOWER = 0;

const VIBRATION = -0.1;
const DAMAGE = 1;
const NEEDPRETIME = -5;
const NEEDDELAY = -1;
const MAXHOLDTIME = 5;
const KICKBACK = 0.1;
const SLOWER = 0.1; 

///Sleeve
const SLEEVE_WIDTH = 5;
const SLEEVE_HEIGHT = 5;
const SLEEVE_TIMETOLIVE = 1000;
const SLEEVE_CONTINUETOMOVE = 0.991;
const SLEEVE_SPREADX = 5;
const SLEEVE_SPREADY = 1;

///Cloud
const CLOUD_WIDTH = 5;
const CLOUD_HEIGHT = 5;
const CLOUD_TIMETOLIVE = 200;
const CLOUD_CONTINUETOMOVE = 0.9;
const CLOUD_CONTINUETOGROW = 1.01;
const CLOUD_SPREADX = 2;
const CLOUD_SPREADY = 2;

///Star
const STAR_WIDTH = 10;
const STAR_HEIGHT = 10;
const STAR_TIMETOLIVE = 200;
const STAR_CONTINUETOMOVE = 0.4;
const STAR_CONTINUETOGROW = 1.05;
const STAR_SPREADX = 5;
const STAR_SPREADY = 2;

///Enemy
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 40;
const ENEMY_HEALTH = 100;
const ENEMY_SPEEDX = 0.2;
const ENEMY_SPEEDY = 0.2;
const ENEMY_STARTY = -200;
const ENEMY_CONTINUETOGROW = 1.1;

///Menu
const MENU_WIDTH = 500;

///Init the scene
function Awake() {
	MyBackground = new Image();
	MyBackground2 = new Image();

	var MyMenu, MyWave;
	MyGun = new Gun(50, 50, MINIGUN_WIDTH, MINIGUN_HEIGHT);
	MyEngine = new Engine();

	canvas = document.getElementById("myCanvas");
	context = canvas.getContext("2d");

	MyBackground.src = 'images/sky.png';
	MyBackground2.src = 'images/sky2.png';

	MyEngine.objects.push(MyGun);

	addEventListener("keydown", OnKeyDown);

	Init();
}

Awake();