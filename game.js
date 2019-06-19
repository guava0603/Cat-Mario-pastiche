var ground_height = 30;
var bg_speed = 4; // 背景移動速度
var player;
// [Todo-g]-1
// 如果是全新的重複物體，記得先全域定義過他的物件群和資訊欄 (eg. blocks, block_info)
var blocks, blue_blocks, question_blocks, monsters, blacks, stairs, grasses;
var block_info, blue_block_info, question_block_info, monster_info, blacks_info, stair_info, grass_info;

var blueflag_time=0;
var step=0;

// 目前地圖左側的 x 值相對於整場遊戲是多少（因為 Mario 能向右邊無限前進，所以這裡要另外計算）
var current_map_left = 0;

// 要新增單一物體（城堡、旗子）請看 [Todo-s]
// 要新增大量重複的物體（草叢、磚塊、怪物）請看 [Todo-g]

var menuState = {
  preload: function() {
    game.load.image('bg', 'assets/image/background.png');
    game.load.image('ground', 'assets/image/ground.png');
    game.load.image('s_btn', 'assets/image/start_button.png');
  },

  create: function() {
    game.add.image(0, 0, 'bg');
    game.add.image(0, game.height - ground_height, 'ground');

    // 按下後就會開始遊戲的按鈕
    this.s_btn = game.add.image(game.width / 2, game.height * 2 / 3, 's_btn');
    this.s_btn.anchor.setTo(0.5, 0.5);
    this.s_btn.scale.setTo(0.5, 0.5);
    this.s_btn.inputEnabled = true;
    // 為按鈕創建滑鼠點擊事件，點擊後跳轉至 L1 state
    this.s_btn.events.onInputDown.add(function() {
      game.state.start('L1');
    });
  },

  update: function() {
  }
}

var firstState = {
  preload: function() {
    game.load.image('bg', 'assets/image/background.png');
    game.load.image('ground', 'assets/image/ground.png');
    game.load.spritesheet('me', 'assets/sprite/Mario.png', 32 , 54);
    game.load.spritesheet('block1', 'assets/image/brick.png', 28, 28);
    game.load.spritesheet('block2', 'assets/image/blue_brick.png', 28, 28);
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // 創建鍵盤事件
    this.cursor = game.input.keyboard.createCursorKeys();

    // 創建背景與可以站上去的地板
    this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg');
    this.floor = game.add.tileSprite(0, game.height - ground_height, game.width, ground_height, 'ground');
    game.physics.arcade.enable(this.floor);
    this.floor.body.immovable = true;

    // Set 所有 group 型態的背景物體
    blocks = game.add.group();
    create_things(blocks, 'block1', 0.5, 0.5, 1, 1, 100);
    blue_blocks = game.add.group();
    create_things(blue_blocks, 'block2', 0.5, 0.5, 1, 1, 100);

    this.create_map();

    // 創建 Mario
    create_mario();
  },

  update: function() {
    // 創建 Mario 和地板的碰撞事件
    game.physics.arcade.collide(player, this.floor);

    // 創建 MArio 和現有磚頭的碰撞事件
    blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });
    blue_blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });

    // Mario 移動相關的判斷
    player_move(this.cursor, this.bg, []);

    generate_blocks(blocks, block_info);
    generate_blocks(blue_blocks, blue_block_info);
  },

  create_map() {
    // 普通磚塊的部分
    block_info = {
      block_x: [ 50, 100], // 請依據 x 的大小排序
      block_y: [450, 450],
      width: 28
    };

    // 藍磚塊的部分
    blue_block_info = {
      block_x: [150, 200], // 請依據 x 的大小排序
      block_y: [500, 500],
      width: 28
    };
    
    init_things([block_info, blue_block_info]);
  }
}

var secondState = {
  preload: function() {
    game.load.image('bg', 'assets/image/background.jpg');
    game.load.image('ground', 'assets/image/floor_16.png');
    game.load.image('castle', 'assets/image/strangebox.png');
    game.load.image('fly_monster', 'assets/image/fly_high_monster.png');
    game.load.image('orange_block', 'assets/image/orange_box_between_strange_box.jpg');
    game.load.image('h_pipe', 'assets/image/horizontal_pipe.png');
    game.load.image('v_pipe', 'assets/image/pipe.png');
    game.load.spritesheet('me', 'assets/sprite/Mario.png', 32 , 54);
    game.load.spritesheet('block1', 'assets/image/brick.png', 28, 28);
    game.load.spritesheet('block2', 'assets/image/blue_brick.png', 28, 28);
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // 創建鍵盤事件
    this.cursor = game.input.keyboard.createCursorKeys();

    // 創建背景與可以站上去的地板
    // [Todo-s]0
    // 在這裡加入圖片與調整其他參數（中心點、縮放、不可移動之類的）
    this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg');
    this.castle = game.add.sprite(50, 395, 'castle');
    this.castle.scale.setTo(0.9,0.9);
    this.orange_block = game.add.sprite(185, 360, 'orange_block');
    this.h_pipe = game.add.sprite(580, 440, 'h_pipe');
    this.v_pipe = game.add.sprite(680, 350, 'v_pipe');
    this.fly_monster = game.add.sprite(700, 350, 'fly_monster');
    this.fly_monster.visible = false;
    this.floor = game.add.tileSprite(0, game.height - ground_height -35, game.width, ground_height+50, 'ground');
    this.floor.scale.setTo(1,0.8);
    game.physics.arcade.enable(this.floor);
    game.physics.arcade.enable(this.orange_block);
    game.physics.arcade.enable(this.h_pipe);
    game.physics.arcade.enable(this.v_pipe);
    game.physics.arcade.enable(this.fly_monster);
    this.floor.body.immovable = true;
    this.orange_block.body.immovable = true;
    this.h_pipe.body.immovable = true;
    this.v_pipe.body.immovable = true;

    // [Todo-g]0
    // 在這裡以 add.grop() 創建物件群，再以 create_things(物件群, 圖片名, arcade_x, arcade_y, scale_x, scale_y, 總數量）初始化
    blocks = game.add.group();
    create_things(blocks, 'block1', 0.5, 0.5, 1, 1, 100);
    blue_blocks = game.add.group();
    create_things(blue_blocks, 'block2', 0.5, 0.5, 1, 1, 100);

    this.create_map();

    // 創建 Mario
    create_mario();
  },

  update: function() {
    // [Todo-s]1
    // 如果是有碰撞效果的物體，在這邊加入碰撞
    game.physics.arcade.collide(player, this.floor);
    game.physics.arcade.collide(player, this.orange_block);
    game.physics.arcade.collide(player, this.h_pipe);
    game.physics.arcade.collide(player, this.v_pipe);

    // [Todo-g]1
    // 在這裡用 forEachAlive() 把目前畫面中存在的物體都與 mario 加上碰撞
    blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });
    blue_blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });

    // 創建 MArio 和enemy的碰撞事件
    game.physics.arcade.overlap(player, this.fly_monster, this.die);
    // Mario 移動相關的判斷
    // [Todo-s]2
    // player_move 的第三個參數是陣列，裡面存放的是所有會跟著地圖移動的單一物體，記得加進來
    player_move(this.cursor, this.bg, [this.floor, this.orange_block, this.h_pipe, this.v_pipe, this.castle, this.fly_monster]);

    // [Todo-g]2
    // 用 generate_blocks(物件群, 物件資訊欄) 來畫出重複物體，記得加進來
    generate_blocks(blocks, block_info);
    generate_blocks(blue_blocks, blue_block_info);

    // 所有「Player 走到某處就觸發什麼事件」的判斷都能寫在這，這樣就不用特別獨立出不同的 player_move 了
    if (player.x + current_map_left >= 680) {
      console.log('done');
      this.fly_monster.visible = true;
      this.fly_monster.body.velocity.y = -800;
    }
  },

  create_map() {
    // [Todo-g]3
    // 把物件資訊欄按照註解填好

    // 普通磚塊的部分
    block_info = {
      block_x: [], // 請依據 x 的大小排序
      block_y: [],
      width: 28    // 圖片寬度
    };


    blue_block_info = {
      block_x: [], // 請依據 x 的大小排序
      block_y: [],
      width: 28
    };

    // [Todo-g]4
    // init_things 參數是一個陣列，裡面裝了 create_map() 裡每個資訊欄
    init_things([block_info, blue_block_info]);
  },
  
  die: function(){
    console.log('die');
  }
}

var thirdState = {
  preload: function() {
    game.load.image('bg', 'assets/image/background2.jpg');
    game.load.image('bigcat', 'assets/image/character2.png');
    game.load.image('ground', 'assets/image/floor_second_kind_16.png');
    game.load.image('gmonster', 'assets/image/green_monster.png');
    game.load.spritesheet('monster', 'assets/image/monster3.png',100,100);
    game.load.spritesheet('me', 'assets/sprite/Mario.png', 32 , 54);
    game.load.spritesheet('block1', 'assets/image/brick.png', 28, 28);
    game.load.spritesheet('block2', 'assets/image/blue_brick.png', 28, 28);
    game.load.spritesheet('block3', 'assets/image/question_box.png', 42, 42);
    game.load.image('v_pipe', 'assets/image/low_pipe.png');
    game.load.image('five_brick', 'assets/image/five_brick.png');
    game.load.image('five_bluebrick', 'assets/image/five_horizontal_bluebrick.png');
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // 創建鍵盤事件
    this.cursor = game.input.keyboard.createCursorKeys();

    // 創建背景與可以站上去的地板
    this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg');
    this.floor = game.add.tileSprite(0, game.height - ground_height -35, game.width, ground_height+50, 'ground');
    this.floor.scale.setTo(1,0.8);
    game.physics.arcade.enable(this.floor);
    this.floor.body.immovable = true;

    // Set 所有非 group 型態的背景物體
    this.green_monster = game.add.sprite(1355, 400, 'gmonster');
    this.green_monster.scale.setTo(1,1);
    game.physics.arcade.enable(this.green_monster);

    this.v_pipe = game.add.sprite(2650, 430, 'v_pipe');
    game.physics.arcade.enable(this.v_pipe);
    this.v_pipe.body.immovable = true;

    this.five_brick = game.add.sprite(3852, 20, 'five_brick');
    game.physics.arcade.enable(this.five_brick);

    this.five_bluebrick = game.add.sprite(3632, 20, 'five_bluebrick');
    game.physics.arcade.enable(this.five_bluebrick);

    this.bigcat = game.add.sprite(2650, 430, 'bigcat');
    game.physics.arcade.enable(this.bigcat);
    
    // Set 所有 group 型態背景物體的參數
    this.create_map();

    // Set 所有 group 型態的背景物體，參數分別為
    // 物體名稱（宣告在檔案最上方）、圖片名稱、anchor.x、anchor.y、scale.x、scale.y、group 總個數
    blocks = game.add.group();
    create_things(blocks, 'block1', 0.5, 0.5, 1, 1, 100);
    blue_blocks = game.add.group();
    create_things(blue_blocks, 'block2', 0.5, 0.5, 1.7, 1.7, 100);
    question_blocks = game.add.group();
    create_things(question_blocks, 'block3', 0.5, 0.5, 1, 1, 100);
    monsters = game.add.group();
    create_things(monsters, 'monster', 0.5, 0.5, 0.5, 0.5, 100);
    blacks = game.add.group();
    create_things(blacks, 'bg', 0, 0, 0.19, 0.19, 10);

    // 創建 Mario
    create_mario();
  },

  update: function() {
    // 創建 Mario 和地板的碰撞事件
    game.physics.arcade.collide(player, this.floor);
    game.physics.arcade.collide(player, this.green_monster);
    if(game.physics.arcade.collide(player, this.v_pipe)) this.bigcatjump(this.bigcat,this.v_pipe);
    if(game.physics.arcade.overlap(player, this.bigcat)) this.die();
    if(game.physics.arcade.overlap(player, this.five_brick)) this.die();
    if(game.physics.arcade.overlap(player, this.five_bluebrick)) this.die();

    // 創建 MArio 和現有磚頭的碰撞事件
    blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });
    blue_blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });
    question_blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });
    monsters.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });

    // 所有 group 形式的背景物體都能用這個方式 generate 出來
    generate_blocks(blocks, block_info);
    generate_blocks(blue_blocks, blue_block_info);
    generate_blocks(question_blocks, question_block_info);
    generate_blocks(monsters, monster_info);
    generate_blocks(blacks, blacks_info);

    // Mario 移動相關的判斷
    // 第三個參數是 array 形式，裡面裝了所有非 group 形式的背景物體
    // 只要這樣包好就能讓這些物體直接能跟著動了～
    player_move(this.cursor, this.bg, [this.five_bluebrick, this.five_brick, this.v_pipe, this.bigcat, this.green_monster]);

    // 所有「Player 走到某處就觸發什麼事件」的判斷都能寫在這，這樣就不用特別獨立出不同的 player_move 了
    if(player.x <= this.five_bluebrick.x + 250 && player.x >= this.five_bluebrick.x) this.five_bluebrick.body.velocity.y = 500;
    if(player.x >= this.five_brick.x) this.five_brick.body.velocity.y = 500;
  },

  create_map() {
    // 普通磚塊的部分
    block_info = {
      block_x: [], // 請依據 x 的大小排序
      block_y: [],
      width: 28
    };

    // 藍磚塊的部分
    blue_block_info = {
      block_x: [680,780,780,880,880,880,980,980,980,980,1230,1230,1230,1230,1330,1330,1330,1430,1430,1530], // 請依據 x 的大小排序
      block_y: [513,513,465,513,465,417,513,465,417,369, 513, 465, 417, 369, 513, 465, 417, 513, 465, 513],
      width: 28
    };

    question_block_info = {
      block_x: [375,420,465,510], // 請依據 x 的大小排序
      block_y: [375,375,375,375],
      width: 42
    };

    monster_info = {
      block_x: [510,400,1100,1750,1800,1850], // 請依據 x 的大小排序
      block_y: [510,510, 510, 510, 510, 510]
    };

    blacks_info = {
      block_x: [2108,2403,2856,3106,1800,3552], // 請依據 x 的大小排序
      block_y: [ 500, 500, 500, 500, 500, 500],
      width: 152
    };
    
    // 以 array 形式包裝上述提到的所有 info，以將所有參數初始值設定好
    init_things([block_info, blue_block_info, question_block_info, monster_info, blacks_info]);
  },

  bigcatjump(bigcat,v_pipe){
    if(player.x <= v_pipe.x){
      bigcat.reset(v_pipe.x+30, v_pipe.y-80);
      bigcat.body.velocity.x = -60;
      bigcat.body.velocity.y = -200;
      bigcat.body.gravity.y = 350;
    }
  },

  die(){
    console.log('die');
  }
}

var fourthState = {
  preload: function() {
    game.load.image('bg', 'assets/image/background.jpg');
    game.load.image('ground', 'assets/image/floor_16.png');
    game.load.image('stair', 'assets/image/stairs.png');
    game.load.image('bigface', 'assets/image/bigface.png');
    game.load.image('bigcat', 'assets/image/character2.png');
    game.load.image('grass', 'assets/image/grass.png');
    game.load.image('low_pipe', 'assets/image/low_pipe.png');
    game.load.image('blue_flag', 'assets/image/blue_flag.png');
    game.load.image('castle', 'assets/image/strangebox.png');
    game.load.image('long_flag', 'assets/image/long_flag.png');
    game.load.spritesheet('me', 'assets/sprite/Mario.png', 32 , 54);
    game.load.spritesheet('block1', 'assets/image/brick.png',50, 50);
    game.load.spritesheet('block2', 'assets/image/blue_brick.png', 28, 28);
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // 創建鍵盤事件
    this.cursor = game.input.keyboard.createCursorKeys();

    // 創建背景與可以站上去的地板
    this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg');
    this.low_pipe = game.add.sprite(80, 430, 'low_pipe');
    this.bigcat = game.add.sprite(115, 400, 'bigcat');
    this.longflag = game.add.sprite(1290, 50, 'long_flag');
    this.blueflag = game.add.sprite(930, 50, 'blue_flag');
    this.bigface = game.add.sprite(45, 25, 'bigface');
    this.bigface2 = game.add.sprite(1810, 25, 'bigface');
    this.floor = game.add.tileSprite(0, game.height - ground_height -35, game.width, ground_height+50, 'ground');
    this.floor.scale.setTo(1,0.8);
    this.block_last = game.add.sprite(1285, 485, 'block1');
    this.grass = game.add.sprite(1870, 500, 'grass');
    this.castle = game.add.sprite(1570, 390, 'castle');
    this.castle.scale.setTo(0.9,0.9);
    game.physics.arcade.enable(this.floor);
    game.physics.arcade.enable(this.block_last);
    game.physics.arcade.enable(this.low_pipe);
    game.physics.arcade.enable(this.bigcat);
    game.physics.arcade.enable(this.longflag);
    game.physics.arcade.enable(this.blueflag);
    this.bigcat.body.velocity.y = -800;
    this.bigcat.body.velocity.x = 100;
    this.floor.body.immovable = true;
    this.low_pipe.body.immovable = true;
    this.block_last.body.immovable = true;

    this.create_map();

    // 創建 Mario
    create_mario();

    stairs = game.add.group();
    create_things(stairs, 'stair', 0.5, 0.5, 1, 1, 100);
    blocks = game.add.group();
    create_things(blocks, 'block1', 0.5, 0.5, 1, 1, 100);
    blue_blocks = game.add.group();
    create_things(blue_blocks, 'block2', 0.5, 0.5, 1.7, 1.7, 100);

  },

  update: function() {
    this.bigcat.body.gravity.y = 1300;

    // 創建 Mario 和地板的碰撞事件
    game.physics.arcade.collide(player, this.floor);
    game.physics.arcade.collide(this.bigcat, this.floor);
    game.physics.arcade.collide(player, this.low_pipe);
    game.physics.arcade.collide(this.bigcat, this.low_pipe, this.catmove2(this.bigcat));
    game.physics.arcade.collide(player, this.bigcat, this.die(0, this.blueflag, this.bigcat));
    // if (game.physics.arcade.collide(player, this.blueflag)) this.collide_flag(this.blueflag, 1, this.block_last);
    if (game.physics.arcade.collide(this.block_last, this.blueflag)) this.collide_flag(this.blueflag, 2, this.block_last);

    // 創建 MArio 和現有磚頭的碰撞事件
    stairs.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
      game.physics.arcade.collide(this.bigcat, block, this.catmove(this.bigcat));
      // if (game.physics.arcade.collide(this.blueflag, block)) this.collide_flag(this.blueflag, 3, this.block_last);
    });
    blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
      // if (game.physics.arcade.collide(this.blueflag, block)) this.collide_flag(this.blueflag, 2, this.block_last);
    });
    blue_blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });

    if (game.physics.arcade.collide(player, this.blueflag)){
      this.blueflag.body.velocity.y=0;
      if (blueflag_time==0) {
        this.blueflag.body.velocity.x = 100;
        console.log("dcfs");
      }
      // if (this.blueflag.body.x-50<=player.body.x && this.blueflag.body.y-30>=player.body.y && step==0){
      //   this.blueflag.body.velocity.x=100;
      //   step=1;
      //   // console.log(this.blueflag.body.y);
      //   // console.log(player.body.y);
      //   console.log("step");
      // }
      //   else if (player.body.y>=this.blueflag.body.y-30) this.die(0,this.blueflag);
        
      // }

      blueflag_time=1;
      console.log(this.blueflag.body.x);
      console.log(player.body.x);
      console.log(this.blueflag.body.y+"y");
      console.log(player.body.y+"yy");

    }


    if(blueflag_time==2 && this.block_last.x-this.blueflag.x>=260 ){
      // blueflag_time=3;
      //&& this.block_last.x-this.blueflag.x>=250
      this.blueflag.body.velocity.x=100;
      console.log("block");
    }

    generate_blocks(blocks, block_info);
    generate_blocks(stairs, stair_info);
    generate_blocks(blue_blocks, blue_block_info);

    // Mario 移動相關的判斷
    player_move(this.cursor, this.bg, [this.bigcat, this.low_pipe, this.bigface, this.blueflag, this.longflag, this.castle, this.bigface2, this.grass, this.block_last]);
  },

  create_map() {
    // 普通磚塊的部分
    block_info = {
      block_x: [], // 請依據 x 的大小排序
      block_y: [],
      width: 28
    };

    stair_info = {
      block_x: [260,310,360,410,460,510,560,610,660,310,360,410,460,510,560,610,660,360,410,460,510,560,610,660,410,460,510,560,610,660,460,510,560,610,660,510,560,610,660,560,610,660,610,660,710,760,810,860,910,960,1010], // 請依據 x 的大小排序
      block_y: [510,510,510,510,510,510,510,510,510,460,460,460,460,460,460,460,460,410,410,410,410,410,410,410,360,360,360,360,360,360,310,310,310,310,310,260,260,260,260,210,210,210,160,160,510,510,510,510,510,510, 510],
      width: 50
    };

    // 藍磚塊的部分
    blue_block_info = {
      block_x: [], // 請依據 x 的大小排序
      block_y: [],
      width: 28
    };

    init_things([block_info, blue_block_info, stair_info]);
  },
  
  die: function(input, blueflag, bigcat){
    if (input==0 && bigcat.body.x>=0) console.log('die');
    if (input==1) {
      blueflag.body.velocity.x=0;
      blueflag.body.immovable=true;
      console.log('die');
    }
  },

  catmove: function(bigcat){
    bigcat.body.velocity.x = 100;
  },
  catmove2: function(bigcat){
    bigcat.body.velocity.x = 100;
  },

  collide_flag: function(blueflag, input, block_last){
    // if (input==1){
    //   console.log(blueflag_time);
    //   if (blueflag_time==0) {
    //     blueflag.body.velocity.x = 100;
    //     console.log("dcfs");
    //     console.log(blueflag.body.velocity.x);
    //   }
    //   blueflag_time=1;
    // }
    if (input==2){
      blueflag_time=2;
      console.log("222");
      blueflag.body.velocity.x=-100;
    }
    // else if (input==3){
    //   console.log("333");
    //   if(blueflag_time==2 && block_last.x-blueflag.x>=250){
    //     blueflag_time=3;
    //     blueflag.body.velocity.x=100;
    //   }
    // }
  }
}

var fifthState = {
  preload: function() {
    game.load.image('bg', 'assets/image/background.jpg');
    game.load.image('ground', 'assets/image/floor_16.png');
    game.load.image('strangebox', 'assets/image/strangebox.png');
    game.load.image('grass', 'assets/image/grass.png');
    game.load.image('gq', 'assets/image/green_question.png');
    game.load.spritesheet('me', 'assets/sprite/Mario.png', 32 , 54);
    game.load.spritesheet('block1', 'assets/image/brick.png', 28, 28);
    game.load.spritesheet('block2', 'assets/image/blue_brick.png', 28, 28);
    game.load.spritesheet('block3', 'assets/image/question_box.png', 42, 42);
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // 創建鍵盤事件
    this.cursor = game.input.keyboard.createCursorKeys();

    // 創建背景與可以站上去的地板
    this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg');
    this.floor = game.add.tileSprite(0, game.height - ground_height-35, game.width, ground_height+50, 'ground');
    this.floor.scale.setTo(1.0,0.8);
    this.strangebox = game.add.sprite(50, 395, 'strangebox');
    this.strangebox.scale.setTo(0.9,0.9);
    this.gq = game.add.sprite(475, 485, 'gq');
    game.physics.arcade.enable(this.floor);
    this.floor.body.immovable = true;

    this.create_map();

    // 創建 Mario
    create_mario();
    
    blocks = game.add.group();
    create_things(blocks, 'block1', 0.5, 0.5, 1, 1, 100);
    blue_blocks = game.add.group();
    create_things(blue_blocks, 'block2', 0.5, 0.5, 1.7, 1.7, 100);
    question_blocks = game.add.group();
    create_things(question_blocks, 'block3', 0.5, 0.5, 1, 1, 100);
    grasses = game.add.group();
    create_things(question_blocks, 'grass', 0.5, 0.5, 1, 1, 100);
  },

  update: function() {
    // 創建 Mario 和地板的碰撞事件
    game.physics.arcade.collide(player, this.floor);

    // 創建 MArio 和現有磚頭的碰撞事件
    blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });
    blue_blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });
    question_blocks.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });
    grasses.forEachAlive(block => {
      game.physics.arcade.collide(player, block);
    });

    // Mario 移動相關的判斷
    player_move(this.cursor, this.bg, [this.floor, this.strangebox, this.gq]);

    generate_blocks(blocks, block_info);
    generate_blocks(blue_blocks, blue_block_info);
    generate_blocks(question_blocks, question_block_info);
    generate_blocks(grasses, grass_info);
  },
  create_map() {
    // 普通磚塊的部分
    block_info = {
      block_x: [], // 請依據 x 的大小排序
      block_y: [],
      width: 28
    };

    // 藍磚塊的部分
    blue_block_info = {
      block_x: [], // 請依據 x 的大小排序
      block_y: [],
      width: 28 * 1.7
    };

    // 問號磚塊的部分
    question_block_info = {
      block_x: [375], // 請依據 x 的大小排序
      block_y: [375],
      width: 42
    };

    // 草地的部分
    grass_info = {
      block_x: [300,780], // 請依據 x 的大小排序
      block_y: [515,515], // 磚頭的編號
      width: 112
    };

    init_things([block_info, blue_block_info, question_block_info, grass_info]);
  }
}

var endState = {
  preload: function() {
  },

  create: function() {
  },

  update: function() {
  }
}

function create_things(thing, name, anchor_x, anchor_y, scale_x, scale_y, total) {
  thing.enableBody = true;
  thing.physicsBodyType = Phaser.Physics.ARCADE;
  thing.createMultiple(total, name);
  thing.setAll('anchor.x', anchor_x);
  thing.setAll('anchor.y', anchor_y);
  thing.setAll('outOfBoundsKill', true);
  thing.setAll('checkWorldBounds', true);
  thing.setAll('body.immovable', true);
  thing.setAll('scale.x', scale_x);
  thing.setAll('scale.y', scale_y);
}

function create_mario() {
  // 畫出 Mario
  player = game.add.sprite(game.width / 4, game.height - ground_height-50, 'me');
  player.anchor.setTo(0.5, 1); // 定位點在下方中間
  player.facingRight = true;   // 一開始都先面向右邊

  // Mario 的動畫創在這邊
  player.animations.add('rightwalk', [1, 2], 8, true);
  player.animations.add('leftwalk', [3, 4], 8, true);
  player.animations.add('rightjump', [5, 6], 16, false);
  player.animations.add('leftjump', [7, 8], 16, false);

  // Mario 的碰撞與重力
  game.physics.arcade.enable(player);
  player.body.gravity.y = 1200;
}

function player_move(cursor, bg, others = []) {
  // 背景移動速度
  if (cursor.left.isDown) {
    if (player.x > player.body.width / 2) player.body.velocity.x = -200;
    else {
      player.body.velocity.x = 0;
      player.x = player.body.width / 2;
    }
    if (!cursor.up.isDown) player.animations.play('leftwalk');
    player.facingRight = false;
  }
  else if (cursor.right.isDown) {
    if (player.x < game.width * 3 / 4) player.body.velocity.x = 200;
    else {
      player.body.velocity.x = 0;
      bg.tilePosition.x -= bg_speed;
      current_map_left += bg_speed;
      others.forEach(other => {
        other.centerX -= bg_speed;
      });
      things_moving();
    }
    if (!cursor.up.isDown) player.animations.play('rightwalk');
    player.facingRight = true;
  }
  else {
    player.body.velocity.x = 0;
    if (player.facingRight) player.frame = 1;
    else player.frame = 3;
    // 停止動畫
    // player.animations.stop();
  }

  if (cursor.up.isDown) {
    if(player.body.touching.down){
        // Move the player upward (jump)
        if (player.facingRight) player.animations.play('rightjump');
        else player.animations.play('leftjump');
        player.body.velocity.y = -750;
    }
  }
}

function init_things(array) {
  array.forEach(info => {
    info.block_total = 0,
    info.max_display = 0      // 目前不在螢幕中，且位置處於螢幕右方，且編號最小的磚頭的編號
    info.block_total = info.block_x.length;
    if (info.block_x.length !== info.block_y.length) console.log(info.block_x.length, info.block_y.length, "[ Error ]: 磚塊的兩個陣列數量不同，到後面會出錯啦");
  });
}

function moving(things, things_info) {
  things.forEachAlive(block => {
    block.centerX -= bg_speed;
    if (block.centerX + things_info.width / 2 < 0) things_info.min_display ++;
  });
}

function things_moving() {
  // [Todo-g]5
  // 如果新增了一個全新的物件群，記得用跟下一面一樣的寫法再加上去ㄛ
  if (blocks && blocks.length > 1) moving(blocks, block_info);
  if (blue_blocks && blue_blocks.length > 1) moving(blue_blocks, blue_block_info);
  if (question_blocks &&  question_blocks.length > 1) moving(question_blocks, question_block_info);
  if (monsters && monsters.length > 1) moving(monsters, monster_info);
  if (blacks && blacks.length > 1) moving(blacks, blacks_info);
  if (stairs && stairs.length > 1) moving(stairs, stair_info);
  if (grasses && grasses.length > 1) moving(grasses, grass_info);
}

function generate_blocks(things, things_info) {
  for (var i = things_info.max_display; i < things_info.block_total; i++) {
    if (things_info.block_x[i] - things_info.width / 2 < current_map_left + game.width) {
      var block = things.getFirstExists(false);
      if (block) {
        block.reset(things_info.block_x[i] - current_map_left, things_info.block_y[i]);
        game.physics.arcade.collide(player, block);
      }
      else console.log('預設物品數量不夠，把 createMultiple 的數值調大');
    } else break;
  }
  things_info.max_display = i;
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'canvas');

// 使用 game.state.add([名字], [變數]) 將新的 state 增加在此
// 使用 game.state.start([名字]) 即可切換目前的 state
game.state.add('menu', menuState);
game.state.add('L1', firstState);
game.state.add('L2', secondState);
game.state.add('L3', thirdState);
game.state.add('L4', fourthState);
game.state.add('L5', fifthState);
game.state.add('end', endState);
game.state.start('L1');