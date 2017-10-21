
// game.global.soldierHealth
// game.global.soldierCurrentBlock
// ourBaseDamage = (baseDamage * (1-getPlayerCritChance()) + (baseDamage * getPlayerCritChance() * getPlayerCritDamageMult()));

// enemyHealth = getEnemyMaxHealth(game.global.world + 1,50);




/*
special maps
11 - the block (Shieldblock)
15 - the wall (Bounty)
21 - dimension of anger (portal)
33 - trimple of doom

*/



var TrimpShifter = {
    STATE_ENUM: {

    },

    Config: {
        Version: '0.2.22',
        LoopInterval: 100,
        Enabled: true,
        LogEnabled: true,
    },

    Settings: {
        AutoBuyStorage: true,
        AutoBuyJobs: true,
        AutoBuyBuildings: true,
        AutoBuyUpgrades: true,
        AutoBuyWeapons: true,
        AutoBuyArmor: true,
        AutoPrestige: true,
        GatewayFragmentRatio: 0.5,
        WormholeHeliumRatio: 0.0,
        StorageRatio: 0.5,
        MaxExplorers: function () {
            return game.global.world * 5;
        },
        JobWeights: {
            Farmer: 25,
            Lumberjack: 30,
            Miner: 40,
            Scientist: 5
        },
        MaxTraps: function () {
            if (game.global.world < 5)
                return 10;
            else if (game.global.world < 20)
                return 100;
            else
                return 1000;
        }

    },

    Variables: {
        LastGathered: 'food',
        TimerID: -1,
        StockpilingTraps: false
    },

    Init: function () {
        console.log('TrimpShifter v.' + TrimpShifter.Config.Version);

        //var s = '<li role="presentation"  id="TrimpShifterTab" onclick="settingTab("TrimpShifter")" class="tabNotSelected settingTab"><a>TrimpShifter</a></li>';
        var li = document.createElement('li');
        li.setAttribute('role', 'presentation');
        li.setAttribute('id', 'TrimpShifterTab');
        li.setAttribute('onclick', "settingTab('TrimpShifter')");
        li.setAttribute('class', 'tabNotSelected settingTab');
        var li_a = document.createElement('a');
        li_a.innerHTML = "TrimpShifter";
        li.append(li_a);
        var parent = document.getElementById('settingsTabs');

        parent.children[0].append(li);

        game.options.menu.ts_autoBuyBuildings = {
            description: "Auto-buy buildings",
            titles: ["Autobuy Buildings Off", "Autobuy Buildings On"],
            extraTags: "general trimpshifter",
            enabled: 1,
            onToggle: function () {
                TrimpShifter.Settings.AutoBuyBuildings = !TrimpShifter.Settings.AutoBuyBuildings;
            }
        };



        TrimpShifter.Start();
    },

    MainLoop: function () {
        //game is paused, do nothing
        if (game.options.menu.pauseGame.enabled)
            return;


        //TrimpShifter is disabled, kick out of loop
        if (!TrimpShifter.Config.Enabled) {
            clearInterval(TrimpShifter.Variables.TimerID);
            console.log('TrimpShifter stopping');
            return;
        }





        //storage always has priority
        if (TrimpShifter.Settings.AutoBuyStorage)
            TrimpShifter.CheckStorage();

        if (TrimpShifter.Settings.AutoBuyJobs)
            TrimpShifter.CheckJobs();



        //check for upgrades that we should wait to buy
        var criticalNeeded = false;

        if (TrimpShifter.Settings.AutoBuyUpgrades) {
            var criticalUpgrades = ['Battle', 'Bloodlust', 'Egg', 'Explorers', 'Miners', 'Scientists', 'Trainers'];

            for (var i = 0; i < criticalUpgrades.length; i++) {
                if (game.upgrades[criticalUpgrades[i]].locked == 0) {

                    if (!TrimpShifter.BuyUpgrade(criticalUpgrades[i])) {
                        criticalNeeded = true;
                    }
                }
            }
        }
        //unable to buy something that's critical, kick out
        if (criticalNeeded)
            return;



        if (TrimpShifter.Settings.AutoBuyUpgrades) {
            var priorityUpgrades = ['Anger', 'Battle', 'Blockmaster', 'Bloodlust', 'Bounty', 'Coordination', 'Efficiency', 'Egg', 'Explorers', 'Gymystic', 'Miners', 'Potency', 'Scientists', 'Speedfarming', 'Speedlumber', 'Speedminer', 'Speedscience', 'TrainTacular', 'Trainers', 'Trapstorm', 'UberHotel', 'UberHouse', 'UberHut', 'UberMansion', 'UberResort'];


            for (var i = 0; i < priorityUpgrades.length; i++) {
                if (game.upgrades[priorityUpgrades[i]].locked == 0) {

                    TrimpShifter.BuyUpgrade(priorityUpgrades[i]);

                }
            }
        }

        if (TrimpShifter.Settings.AutoPrestige) {

            var upgrades = [
                'Dagadder',
                'Megamace',
                'Axeidic',
                'Polierarm',
                'Greatersword',

                'Bootboost',
                'Hellishmet',
                'Pantastic',
                'Bestplate',
                'Smoldershoulder',

                'Supershield',
            ];

            for (var i = 0; i < upgrades.length; i++) {
                if (game.upgrades[upgrades[i]].locked == 0)
                    TrimpShifter.BuyUpgrade(upgrades[i]);
            }
        }





        if (TrimpShifter.Settings.AutoBuyWeapons) {


            //level up equipment
            var weapons = ['Dagger', 'Mace', 'Battleaxe', 'Polearm', 'Greatsword'];



            for (var i = 0; i < weapons.length; i++) {

                if (game.equipment[weapons[i]].locked == 0 && game.equipment[weapons[i]].level < 9) {
                    TrimpShifter.BuyEquipment(weapons[i]);
                }
            }



        }

        if (TrimpShifter.Settings.AutoBuyArmor) {


            //level up equipment
            var armor = ['Boots', 'Helmet', 'Pants', 'Breastplate', 'Shoulderguards'];




            for (var i = 0; i < armor.length; i++) {

                if (game.equipment[armor[i]].locked == 0 && game.equipment[armor[i]].level < 11) {
                    TrimpShifter.BuyEquipment(armor[i]);
                }
            }

            if (game.equipment.Shield.locked == 0 && game.equipment.Shield.level < 5) {
                TrimpShifter.BuyEquipment('Shield');
            }


        }




        if (TrimpShifter.Settings.AutoBuyBuildings) {

            //level up buildings
            var buildings = [
                'Gym',
                'Nursery',
                'Tribute',
                'Collector',
                'Wormhole',
                'Gateway',
                'Resort',
                'Hotel',
                'Mansion',
                'House',
                'Hut'
            ];

            for (var i = 0; i < buildings.length; i++) {
                if (game.buildings[buildings[i]].locked == 0) {
                    var build = true;
                    if (buildings[i] == 'Wormhole') {
                        var h = Math.floor(10 * Math.pow(1.075, game.buildings.Wormhole.owned));
                        if (game.resources.helium.owned * TrimpShifter.Settings.WormholeHeliumRatio < h)
                            build = false;
                    }
                    else if (buildings[i] == 'Gateway') {
                        var f = game.buildings.Gateway.cost.fragments[0] * Math.pow(game.buildings.Gateway.cost.fragments[1], game.buildings.Gateway.purchased);
                        if (game.resources.fragments.owned * TrimpShifter.Settings.GatewayFragmentRatio < f)
                            build = false;
                    }

                    if (build) {
                        TrimpShifter.BuyBuilding(buildings[i]);
                    }
                }
            }


        }


        if (!game.global.fighting && game.upgrades.Bloodlust.owned == 0 && game.upgrades.Battle.owned == 1) {
            fightManual();
        }



        //no trimps owned at all
        if (game.resources.trimps.owned == 0) {
            //got a trap, use it
            if (game.buildings.Trap.owned > 0) {
                setGather('trimps');
                return;
            }



            if (game.global.buildingsQueue.length > 0) {
                setGather('buildings');
                return;
            }

            //got resources, build a trap
            if (game.resources.food.owned >= 15 && game.resources.wood.owned >= 10) {
                TrimpShifter.BuyBuilding('Trap');
                return;
            }



            //not enough wood to trap
            if (game.resources.wood.owned < 10) {
                setGather('wood');
                return;
            }

            //shed locked, we need food
            if (game.buildings.Shed.locked == 1 && game.resources.food.owned < 15) {
                setGather('food');
                return;
            }




        }



        else {



            //game.resources.trimps.owned==0
            //new game, do stuff

            // if(game.resources.trimps.owned/game.resources.trimps.realMax())<0.5
            // below breeding threshhold, check traps
            // setGather('trimps')


            // game.global.trapBuildAllowed
            // check if autotrap is available

            // game.global.trapBuildToggled



            if (
                game.global.buildingsQueue.length > 0
                && game.global.playerGathering != 'buildings'
            ) {
                //building *something*


                TrimpShifter.Variables.LastGathered = game.global.playerGathering;

                setGather('buildings');
            }

            else if (game.global.buildingsQueue.length == 0 && game.global.playerGathering == 'buildings') {

                setGather(TrimpShifter.Variables.LastGathered);
            }


        }



    },

    CheckStorage: function () {
        var didBuy = true;

        while (didBuy) {
            didBuy = false;
            if (game.buildings.Barn.locked == 0 && (game.resources.food.owned / (game.resources.food.max * (1 + (game.portal.Packrat.modifier * game.portal.Packrat.level)))) > TrimpShifter.Settings.StorageRatio) {
                if (TrimpShifter.BuyBuilding('Barn'))
                    didBuy = true;
            }

            if (game.buildings.Shed.locked == 0 && (game.resources.wood.owned / (game.resources.wood.max * (1 + (game.portal.Packrat.modifier * game.portal.Packrat.level)))) > TrimpShifter.Settings.StorageRatio) {
                if (TrimpShifter.BuyBuilding('Shed'))
                    didBuy = true;
            }

            if (game.buildings.Forge.locked == 0 && (game.resources.metal.owned / (game.resources.metal.max * (1 + (game.portal.Packrat.modifier * game.portal.Packrat.level)))) > TrimpShifter.Settings.StorageRatio) {
                if (TrimpShifter.BuyBuilding('Forge'))
                    didBuy = true;
            }
        }
    },

    CheckJobs: function () {

        var didBuy = true;

        while (didBuy && game.workspaces > 0) {
            didBuy = false;
            if (game.jobs.Trainer.locked == 0) {

                var trainer_cost = game.jobs.Trainer.cost.food[0] * Math.pow(game.jobs.Trainer.cost.food[1], game.jobs.Trainer.owned);
                if (trainer_cost <= game.resources.food.owned) {
                    TrimpShifter.BuyJob('Trainer');
                    didBuy = true;
                }

            }
        }
        didBuy = true;

        while (didBuy && game.workspaces > 0) {
            didBuy = false;

            if (game.jobs.Explorer.locked == 0) {
                var explorer_cost = game.jobs.Explorer.cost.food[0] * Math.pow(game.jobs.Explorer.cost.food[1], game.jobs.Explorer.owned);

                if (game.jobs.Explorer.owned < TrimpShifter.Settings.MaxExplorers() && explorer_cost <= game.resources.food.owned) {
                    TrimpShifter.BuyJob('Explorer');
                    didBuy = true;
                }
            }
        }


        var lim = Math.min(100, game.workspaces);// Math.ceil(game.workspaces / 4);


        while (lim > 0) {

            var
                weightTotal = TrimpShifter.Settings.JobWeights.Farmer + TrimpShifter.Settings.JobWeights.Lumberjack + TrimpShifter.Settings.JobWeights.Miner + TrimpShifter.Settings.JobWeights.Scientist,
                farmerWeight = TrimpShifter.Settings.JobWeights.Farmer / weightTotal,
                lumberjackWeight = TrimpShifter.Settings.JobWeights.Lumberjack / weightTotal,
                minerWeight = TrimpShifter.Settings.JobWeights.Miner / weightTotal,
                scientistWeight = TrimpShifter.Settings.JobWeights.Scientist / weightTotal;

            var
                totalWorkers = game.workspaces + game.jobs.Farmer.owned + game.jobs.Lumberjack.owned + game.jobs.Miner.owned + game.jobs.Scientist.owned;



            if (game.jobs.Scientist.locked == 0 && (game.jobs.Scientist.owned / totalWorkers) < scientistWeight)
                TrimpShifter.BuyJob('Scientist');

            if (game.jobs.Miner.locked == 0 && (game.jobs.Miner.owned / totalWorkers) < minerWeight)
                TrimpShifter.BuyJob('Miner');

            if (game.jobs.Lumberjack.locked == 0 && (game.jobs.Lumberjack.owned / totalWorkers) < lumberjackWeight)
                TrimpShifter.BuyJob('Lumberjack');

            if (game.jobs.Farmer.locked == 0 && (game.jobs.Farmer.owned / totalWorkers) < farmerWeight)
                TrimpShifter.BuyJob('Farmer');
            lim--;
        }


    },



    Stop: function () {
        TrimpShifter.Config.Enabled = false;
    },
    Start: function () {
        console.log('TrimpShifter starting');
        TrimpShifter.Config.Enabled = true;
        TrimpShifter.Variables.TimerID = setInterval(TrimpShifter.MainLoop, TrimpShifter.Config.LoopInterval);
    },

    BuyJob: function (what) {
        var currTab = game.global.numTab, result = false;
        numTab(1);
        result = buyJob(what, true, true);
        numTab(currTab);
        return result;
    },
    BuyBuilding: function (what) {

        if (canAffordBuilding(what, false, false, false, false, 1)) {
            console.log('TrimpShifter - buying building ' + what);
            var currTab = game.global.numTab;
            numTab(1);
            buyBuilding(what, true, true);
            numTab(currTab);
            return true;
        }
        else {
            return false;
        }
    },
    BuyUpgrade: function (what) {
        var currTab = game.global.numTab;
        numTab(1);

        var result = buyUpgrade(what, true, true);
        if (result && TrimpShifter.Config.LogEnabled)
            console.log('TrimpShifter - buying upgrade ' + what);

        numTab(currTab);
        return result;
    },
    BuyEquipment: function (what) {
        var canBuy = false;
        if (what == 'Shield') {
            if (game.resources.wood.owned >= (game.equipment["Shield"].cost.wood[0] * Math.pow(game.equipment["Shield"].cost.wood[1], game.equipment["Shield"].level)) * Math.pow(0.95, game.portal.Artisanistry.level))
                canBuy = true;
        }
        else {
            if (game.resources.metal.owned >= (game.equipment[what].cost.metal[0] * Math.pow(game.equipment[what].cost.metal[1], game.equipment[what].level)) * Math.pow(0.95, game.portal.Artisanistry.level))
                canBuy = true;
        }
        if (canBuy) {
            var currTab = game.global.numTab;
            numTab(1);
            buyEquipment(what, null, true);
            numTab(currTab);
            if (TrimpShifter.Config.LogEnabled)
                console.log('TrimpShifter - buying equipment ' + what);
        }
    },
    Debug: function (msg) {

    },
    Message: function (msg) {

    }


}





setTimeout(TrimpShifter.Init, 2000);
