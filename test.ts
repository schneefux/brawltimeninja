import { plot, Plot } from 'nodeplotlib'
import { PlotType } from 'plotly.js'

const data: Plot[] = []

// TODO allow arbitrary parameters?
interface Model<D> {
  /**
   * Prior distribution of theta
   */
  prior: (theta: number) => number
  /**
   * Likelihood with one parameter
   * theta in [0.0, 1.0]
   */
  // TODO support arbitrary parameters - integral with monte carlo
  likelihood: (data: D) => (theta: number) => number
}

function plotFunction(f: (x: number) => number, name: string): void {
  const trace = {
    x: <number[]>[],
    y: <number[]>[],
    type: 'scatter' as PlotType,
    name,
  }

  console.log(f(0.50001))
  let sum = 0
  for (let x = 0; x < 1; x += 0.001) {
    const value = f(x)
    trace.x.push(x)
    sum += value
    trace.y.push(sum)
  }

  data.push(trace)
}

/**
 * Rectangle rule
 * TODO implement Gaussian Quadrature
 * JS number problems?
 */
function integral(start: number, end: number, steps: number, f: (x: number) => number): number {
  return gaussLegendre(start, end, steps, f)
  let result = 0
  const step = (end - start) / steps
  for (let x = start; x < end; x += step) {
    result += step * f(x + 0.5 * step)
  }
  return result
}

function gaussLegendre(a: number, b: number, n: number, fn: (x: number) => number) {
  const factorial = (n: number) => n  <= 1 ? 1 : n * factorial(n - 1);
  const M = (n: number) => (n - (n % 2 != 0 ? 1 : 0)) / 2;

	// coefficients of the Legendre polynomial
	const coef = [...Array(M(n) + 1)].map((v, m) => v = (-1) ** m * factorial(2 * n - 2 * m) / (2 ** n * factorial(m) * factorial(n - m) * factorial(n - 2 * m)));
	// the polynomial function
	const f = x => coef.map((v, i) => v * x ** (n - 2 * i)).reduce((sum, item) => sum + item, 0);
	const terms = coef.length - (n % 2 == 0 ? 1 : 0);
	// coefficients of the derivative polybomial
	const dcoef = [...Array(terms)].map((v, i) => v = n - 2 * i).map((val, i) => val * coef[i]);
	// the derivative polynomial function
	const df = x => dcoef.map((v, i) => v * x ** (n - 1 - 2 * i)).reduce((sum, item) => sum + item, 0);
	const guess = [...Array(n)].map((v, i) => Math.cos(Math.PI * (i + 1 - 1 / 4) / (n + 1 / 2)));
	// Newton Raphson
	const roots = guess.map(xo => [...Array(100)].reduce(x => x - f(x) / df(x), xo));
	const weights = roots.map(v => 2 / ((1 - v ** 2) * df(v) ** 2));
	return (b - a) / 2 * weights.map((v, i) => v * fn((b - a) * roots[i] / 2 + (a + b) / 2)).reduce((sum, item) => sum + item, 0);
}

function calculateMarginalLikelihood<D>(model: Model<D>, data: D): number {
  const likelihood = model.likelihood(data)
  return integral(0.0, 1.0, 100, (theta: number) => model.prior(theta) * likelihood(theta))
}

function calculateBayesFactor<D>(model1: Model<D>, model2: Model<D>, data: D): number {
  return calculateMarginalLikelihood(model1, data) / calculateMarginalLikelihood(model2, data)
}

/**
 * When the hypotheses are simple point hypotheses, the Bayes factor is equivalent to the likelihood ratio.
 * The prior is `f(x) = 1 where x=h0, 0 otherwise` which simplifies the calculation.
 */
function calculateLikelihoodRatio<D>(model: Model<D>, data: D, h0: number, h1: number): number {
  const likelihood = model.likelihood(data)
  return likelihood(h0) / likelihood(h1)
}

interface SuccessFromSample {
  sample: number
  successes: number
}

/*
const model: Model<SuccessFromSample> = {
  prior: theta => 0.5,
  likelihood: data => binomial(data.sample, data.successes)
}

// TODO Problem: Was sind die beiden Hypothesen? Wenn `h1=win rate` der Daten, dann ist h1 immer wahrscheinlicher.
console.log(calculateLikelihoodRatio(model, { sample: 10, successes: 6 }, 0.5, 0.8))
*/

/**
 * Normal distribution
 */
const normal = (mu: number, sigma: number) => (x: number): number => {
  return 1 / (sigma * Math.sqrt(2 * Math.PI)) * Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)))
}

/**
 * Binomial distribution
 */
const binomial = (k: number, n: number): (p: number) => number => {
  const p = k/n
  const q = 1 - p
  if (n * p < 5 || n * q < 5) {
    // binomial
    const factorial = (n: number) => {
      let result = 1
      for (let i = 2; i <= n; i++) {
        result *= i
      }
      return result
    }

    const n_over_k = factorial(n) / (factorial(k) * factorial(n - k))
    return p => n_over_k * Math.pow(p, k) * Math.pow(1 - p, n - k)
  } else {
    // normal approximation
    return p => {
      const q = 1 - p
      return 1 / Math.sqrt(n * p * q) * 1 / Math.sqrt(2 * Math.PI) * Math.exp(-Math.pow(k - n * p, 2) / (2 * n * p * q))
    }
  }
}

function compareDatasets(priorData: SuccessFromSample, data: SuccessFromSample, h0Start: number, h0End: number): number {
  // ??? korrekt?
  const priorP = priorData.successes / priorData.sample
  const priorMu = priorData.successes * priorP
  const priorSigma = Math.sqrt(priorMu * (1 - priorP))
  const priorCV = priorSigma / priorMu
  const priorPdf = normal(priorP, priorP*priorCV)

  const model0: Model<SuccessFromSample> = {
    prior: theta => theta >= h0Start && theta < h0End ? priorPdf(theta) : 0,
    likelihood: data => binomial(data.successes, data.sample),
  }

  const model1: Model<SuccessFromSample> = {
    prior: theta => theta >= h0Start && theta < h0End ? 0 : priorPdf(theta),
    likelihood: data => binomial(data.successes, data.sample),
  }

  plotFunction(t => model0.likelihood(data)(t) * model0.prior(t), 'h0')
  plotFunction(t => model1.likelihood(data)(t) * model1.prior(t), 'h1')
  // plotFunction(model1.prior, 'prior')

  const factor = calculateBayesFactor(model0, model1, data)
  if (factor < 1/3) {
    console.log('evidence for h1')
  }
  if (factor > 3) {
    console.log('evidence for h0')
  }
  return factor
}

// interval size = effect size
// TODO visualisieren
console.log(compareDatasets({ successes: 79000, sample: 130000 }, { successes: 26000, sample: 41000 }, 0.53, 0.62))

plot(data)
