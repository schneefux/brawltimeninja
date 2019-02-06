export interface HeroStatistic {
    label: string;
    value: number;
    icon: string;
}

export interface PlayerStatistic {
    label: string;
    value: number | string;
}

export interface ModeStatistic {
    label: string;
    value: number | string;
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

export interface Player {
    id: string;
    name: string;
    minutesSpent: number;
    heroes: {
        [id: string]: Hero;
    };
    modes: {
        [id: string]: Mode;
    };
    stats: {
        [id: string]: PlayerStatistic;
    };
}