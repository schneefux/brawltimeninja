export interface Statistic {
    label: string;
    value: number | string;
}

export interface HeroStatistic extends Statistic {
    icon: string;
}

export interface PlayerStatistic extends Statistic {
}

export interface ModeStatistic extends Statistic {
}

export interface Mode {
    label: string;
    icon: string;
    background: string;
    stats: {
        [id: string]: ModeStatistic;
    };
}

export interface Hero {
    label: string;
    icon: string;
    stats: {
        [id: string]: HeroStatistic;
    };
}

export interface PlayerIdentifier {
    id: string;
    name: string;
}

export interface Player extends PlayerIdentifier {
    minutesSpent: number;
    heroes: {
        [id: string]: Hero;
    };
    heroStats?: {
        [id: string]: PlayerStatistic;
    }
    modes: {
        [id: string]: Mode;
    };
    stats: {
        [id: string]: PlayerStatistic;
    };
}
