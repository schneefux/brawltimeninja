---
id: measuring-map-quality
title: Measuring Map Quality - The Gini Coefficient
question: What is the Gini coefficient?
---
Brawl Stars has almost 200 distinct maps. With the daily Map Maker Competition
Winner, there is a new map available to play every day. Unarguably, some maps
must be better than others. How can we measure that?

Players enjoy to play their favorite Brawler and to try different team compositions. Let us assume that the best maps are the most diverse maps: On a perfect map, every Brawler would be equally viable and fun to play. Now let us also assume that players notice when a certain player is not viable or not fun on a map, so they will prefer a different Brawler on this map instead.

We can put this assumption into numbers: Let us assume that, with more and more battles being played on a particular map, the use rate of viable Brawlers will be high and the use rate of not so viable Brawlers will be low. Ideally, for a map where every Brawler was equally viable, the use rates of all Brawlers would be the same.

On the Brawl Time Ninja Map Tier Lists pages, we can quickly compare the Use Rates of all Brawlers using the "Graph" Layout. Below is a screenshot of [Gem Grab - Double Swoosh](https://brawltime.ninja/tier-list/mode/gem-grab/map/Double-Swoosh?season=month), a popular map that has been played more than 400 000 times over the past month.

![Use rate graph for Gem Grab - Double Swoosh](/images/use_rate_graph_double_swoosh.png)

In this graph, we can see a pattern: The use rates of most Brawlers are almost evenly distributed among 2%, with 6 Brawlers closer to 4% and Tara at over 8%. The top 5 Brawlers make up 26.8% use rate in total.

Let us compare this graph with the graph for [Bounty - Snake Prairie](https://brawltime.ninja/tier-list/mode/bounty/map/Snake-Prairie?season=month):

![Use rate graph for Bounty - Snake Prairie](/images/use_rate_graph_snake_prairie.png)

Most Brawlers have use rates close to 1%, with three Brawlers (Bo, Shelly and Tara) above 10% Use Rate. The top 5 Brawlers make up 53.4% use rate! You are almost guaranteed to meet one of the top 5 Brawlers in every Battle.

Playing on Snake Prairie is probably fun every once in a while, but playing against the same team compositions every Battle is repetetive. For the long term, Double Swoosh is a much better map compared to Snake Prairie.

Having explored and validated using the distribution of use rates to assess map meta quality, we need to calculate a metric. Luckily, statistics has a tool for us: [The Gini coefficient](https://en.wikipedia.org/wiki/Gini_coefficient) can be used to measure the evenness of a distribution. Brawl Time Ninja calculates it as half of the relative mean absolute difference of Brawler use rates. Without going further into detail, all you need to know is: With a perfect map, when the use rates are the same for all Brawlers, the Gini coefficient is 0. On the worst map imaginable, when one Brawler has 100% use rates and all others 0%, the Gini coefficient is 1.

For Snake Prairie, the Gini coefficient is 0.55. Double Swoosh has a much lower Gini coefficient of 0.25. Looking at a few maps, the Gini coefficient is 0.32 on average, with 1 out of 4 maps having a Gini coefficient better than 0.225 and 1 out of 4 maps having a Gini coefficient worse than 0.425. To aid you in interpreting these numbers, Brawl Time Ninja labels them from "Excellent" to "Awful".

Great! We can now use the Gini coefficient to objectively compare maps. You can view the Gini coefficient as "Balance Rating" in the new map details card on every Map Tier List page.

![Map details for Bounty - Snake Prairie, showing a poor balance rating for a high Gini coefficient](/images/map_details_snake_prairie.png)