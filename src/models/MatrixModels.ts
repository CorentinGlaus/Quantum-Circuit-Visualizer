// Python simulator translated into typescript with the help of an LLM
// ─── Complex ─────────────────────────────────────────────────────────────────

import type { InitState } from "./CircuitModels";

/**
 * An immutable complex number  a + bi.
 * All arithmetic operations return new Complex instances (value semantics).
 */
export class Complex {
  private readonly _re: number;
  private readonly _im: number;

  /** The imaginary unit  i = sqrt(−1). */
  static readonly i: Complex = new Complex(0, 1);

  constructor(realPart: number = 0, imaginaryPart: number = 0) {
    this._re = realPart;
    this._im = imaginaryPart;
  }

  get re(): number { return this._re; }
  get im(): number { return this._im; }

  /** Human-readable form: "3", "2i", "3+2i", or "3-2i". */
  toString(): string {
    if (this._im === 0) return `${this._re}`;
    if (this._re === 0) return `${this._im}i`;
    if (this._im < 0) return `${this._re}-${-this._im}i`;
    return `${this._re}+${this._im}i`;
  }

  /**
   * Modulus / absolute value  |z| = sqrt(a² + b²).
   * Geometrically: the distance from the origin in the complex plane.
   */
  mag(): number {
    return Math.sqrt(this._re ** 2 + this._im ** 2);
  }

  /**
   * Complex conjugate  z* = a − bi.
   * Reflects the number across the real axis.
   */
  conjugate(): Complex {
    return new Complex(this._re, -this._im);
  }

  /** Unary negation  −z = −a − bi. */
  neg(): Complex {
    return new Complex(-this._re, -this._im);
  }

  /** Addition:  this + other. Accepts a real number or another Complex. */
  add(other: Complex | number): Complex {
    if (typeof other === "number") {
      return new Complex(this._re + other, this._im);
    }
    return new Complex(this._re + other._re, this._im + other._im);
  }

  /** Subtraction:  this − other. */
  sub(other: Complex | number): Complex {
    if (typeof other === "number") {
      return new Complex(this._re - other, this._im);
    }
    return new Complex(this._re - other._re, this._im - other._im);
  }

  /**
   * Right-hand subtraction:  other − this.
   * Needed when a plain number appears on the left: e.g. `(3).rsub(z)` ≡ 3 − z.
   */
  rsub(other: Complex | number): Complex {
    if (typeof other === "number") {
      return new Complex(other - this._re, -this._im);
    }
    return new Complex(other._re - this._re, other._im - this._im);
  }

  /**
   * Multiplication  (a+bi)(c+di) = (ac−bd) + (ad+bc)i.
   * Uses the standard distributive formula — no Karatsuba tricks here.
   */
  mul(other: Complex | number): Complex {
    if (typeof other === "number") {
      return new Complex(this._re * other, this._im * other);
    }
    return new Complex(
      this._re * other._re - this._im * other._im,
      this._re * other._im + this._im * other._re,
    );
  }
}


// ─── Scalar alias ────────────────────────────────────────────────────────────

/** Anything that can appear as a matrix entry or scalar multiplier. */
export type Scalar = Complex | number;

/**
 * A control-bit descriptor for {@link qubitWiseMultiply}.
 *   [0] wireIndex – which qubit line acts as a control
 *   [1] flag      – true = control (|1⟩ activates), false = anti-control (|0⟩ activates)
 */
export type ControlBit = [wireIndex: number, flag: boolean];


// ─── Matrix ──────────────────────────────────────────────────────────────────

/**
 * A rectangular matrix of {@link Complex} entries.
 *
 * Construction:
 *   new Matrix([[1,0],[0,1]])    – from a nested literal (numbers or Complex)
 *   new Matrix(rows, cols)       – zero matrix of given size
 *
 * Design note on `m` getter
 * ─────────────────────────
 * `qubitWiseMultiply` lives outside this class and needs fast element-level
 * read/write access to the internal buffer.  Rather than paying the overhead
 * of per-element getters / setters, we expose `m` as a direct reference to
 * the underlying 2-D array.  Callers should treat this as an internal detail
 * and not mutate it unless they own the matrix exclusively (e.g. a freshly
 * constructed deep copy).
 */
export class Matrix {
  private readonly _rows: number;
  private readonly _cols: number;
  // mutable contents even though the reference itself is readonly
  private readonly _m: Complex[][];

  // ── Constructor overloads ──────────────────────────────────────────────────

  /** Build a matrix from a nested array of Scalars. */
  constructor(data: Scalar[][]);
  /** Build a zero matrix with the given dimensions. */
  constructor(rows: number, cols: number);
  constructor(dataOrRows: Scalar[][] | number, cols?: number) {
    if (Array.isArray(dataOrRows)) {
      this._rows = dataOrRows.length;
      this._cols = dataOrRows.length > 0 ? dataOrRows[0].length : 0;
      this._m = dataOrRows.map(row => row.map(Matrix._toComplex));
    } else if (typeof dataOrRows === "number" && cols !== undefined) {
      this._rows = dataOrRows;
      this._cols = cols;
      this._m = Array.from({ length: dataOrRows }, () =>
        Array.from({ length: cols }, () => new Complex()),
      );
    } else {
      throw new Error("Provide a data array, or both rows and cols.");
    }
  }

  // ── Accessors ─────────────────────────────────────────────────────────────

  get rows(): number { return this._rows; }
  get cols(): number { return this._cols; }

  /**
   * Direct reference to the internal buffer.
   * See class-level design note above before mutating from outside.
   */
  get m(): Complex[][] { return this._m; }

  // ── Internal helpers ──────────────────────────────────────────────────────

  private static _toComplex(v: Scalar): Complex {
    return v instanceof Complex ? v : new Complex(v, 0);
  }

  // ── Instance methods ──────────────────────────────────────────────────────

  /** Returns a new matrix that is an independent deep copy of this one. */
  deepCopy(): Matrix {
    return new Matrix(
      this._m.map(row => row.map(z => new Complex(z.re, z.im))),
    );
  }

  /** Renders the matrix with right-justified columns for readability. */
  toString(): string {
    // Find the maximum string width for each column
    const colWidths = Array.from({ length: this._cols }, (_, c) =>
      Math.max(...Array.from({ length: this._rows }, (_, r) =>
        this._m[r][c].toString().length,
      )),
    );

    return this._m
      .map(row =>
        "[" +
        row.map((z, c) => z.toString().padStart(colWidths[c])).join(", ") +
        "]",
      )
      .join("\n");
  }

  /** Element-wise addition.  Both matrices must have identical dimensions. */
  add(other: Matrix): Matrix {
    if (this._rows !== other._rows || this._cols !== other._cols) {
      throw new Error("Matrices must have the same dimensions to be added.");
    }
    return new Matrix(
      this._m.map((row, r) => row.map((z, c) => z.add(other._m[r][c]))),
    );
  }

  /**
   * Multiplication — handles two cases:
   *   Matrix × Matrix  (standard row-column dot product, O(n³))
   *   Matrix × Scalar  (element-wise scaling)
   */
  mul(other: Matrix | Scalar): Matrix {
    if (other instanceof Matrix) {
      if (this._cols !== other._rows) {
        throw new Error(
          "Column count of left matrix must equal row count of right matrix.",
        );
      }
      // Allocate result buffer
      const data: Complex[][] = Array.from({ length: this._rows }, () =>
        Array.from({ length: other._cols }, () => new Complex()),
      );
      for (let r = 0; r < this._rows; r++) {
        for (let c = 0; c < other._cols; c++) {
          let sum = new Complex();
          for (let k = 0; k < this._cols; k++) {
            sum = sum.add(this._m[r][k].mul(other._m[k][c]));
          }
          data[r][c] = sum;
        }
      }
      return new Matrix(data);
    } else {
      // Scalar multiplication — commutative, so rmul delegates here too
      const s = Matrix._toComplex(other);
      return new Matrix(this._m.map(row => row.map(z => z.mul(s))));
    }
  }

  /** Right-hand scalar multiplication: scalar × this (commutative). */
  rmul(other: Scalar): Matrix {
    return this.mul(other);
  }

  /**
   * Conjugate transpose (Hermitian adjoint)  A†.
   * Transposes rows/cols AND takes the complex conjugate of every entry.
   * For unitary matrices U†U = I, which is how quantum gates preserve norm.
   */
  conjugateTranspose(): Matrix {
    const result = new Matrix(this._cols, this._rows);
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        result._m[c][r] = this._m[r][c].conjugate();
      }
    }
    return result;
  }

  /**
   * Kronecker (tensor) product  A ⊗ B.
   *
   * If A is m×n and B is p×q, the result is (m·p)×(n·q).
   * In quantum computing, A ⊗ B represents applying gate A to one qubit
   * and gate B to another simultaneously (independent wires).
   */
  kron(other: Matrix): Matrix {
    const result = new Matrix(
      this._rows * other._rows,
      this._cols * other._cols,
    );
    for (let rr = 0; rr < result._rows; rr++) {
      for (let rc = 0; rc < result._cols; rc++) {
        const r = Math.floor(rr / other._rows);
        const c = Math.floor(rc / other._cols);
        const r2 = rr % other._rows;
        const c2 = rc % other._cols;
        result._m[rr][rc] = this._m[r][c].mul(other._m[r2][c2]);
      }
    }
    return result;
  }

  /**
   * Repeated Kronecker product  A^{⊗k} = A ⊗ A ⊗ … ⊗ A  (k times).
   * Exponent 0 → identity of size this._rows.
   *
   * Implemented recursively — fine for the small exponents used in
   * quantum circuits (typically k ≤ 20).
   */
  kronPower(exponent: number): Matrix {
    if (exponent < 0) throw new Error("Exponent must be non-negative.");
    if (exponent === 0) return Matrix.identity(this._rows);
    if (exponent === 1) return this;
    return this.kron(this.kronPower(exponent - 1));
  }

  // ── Static factories ──────────────────────────────────────────────────────

  /** Returns the n×n identity matrix  Iₙ. */
  static identity(size: number): Matrix {
    return new Matrix(
      Array.from({ length: size }, (_, r) =>
        Array.from({ length: size }, (_, c) =>
          new Complex(r === c ? 1 : 0, 0),
        ),
      ),
    );
  }

  /**
   * Multiplies a list of matrices, choosing the cheapest pair to combine at
   * each step (greedy cost heuristic — not full optimal chain order).
   *
   * Cost of multiplying A(m×k) × B(k×n) = m·k·n  scalar multiplications.
   */
  static naryMult(matrices: Matrix[]): Matrix {
    if (matrices.length === 0) throw new Error("Matrix list is empty.");
    const list = [...matrices];
    while (list.length > 1) {
      let minCost = Infinity;
      let index = 0;
      for (let i = 0; i < list.length - 1; i++) {
        const cost = list[i]._rows * list[i]._cols * list[i + 1]._cols;
        if (cost < minCost) { minCost = cost; index = i; }
      }
      const product = list[index].mul(list[index + 1]);
      list.splice(index, 2, product);
    }
    return list[0];
  }

  /**
   * Kronecker-product chain, with the same greedy cost heuristic.
   * Cost of A(m×n) ⊗ B(p×q) = m·p·n·q  entries in the result.
   */
  static naryKron(matrices: Matrix[]): Matrix {
    if (matrices.length === 0) throw new Error("Matrix list is empty.");
    const list = [...matrices];
    while (list.length > 1) {
      let minCost = Infinity;
      let index = 0;
      for (let i = 0; i < list.length - 1; i++) {
        const cost =
          list[i]._rows * list[i + 1]._rows *
          list[i]._cols * list[i + 1]._cols;
        if (cost < minCost) { minCost = cost; index = i; }
      }
      const product = list[index].kron(list[index + 1]);
      list.splice(index, 2, product);
    }
    return list[0];
  }

  // ── Standard quantum gate constants ───────────────────────────────────────
  // These are the single-qubit Pauli matrices, Hadamard, phase gates, and
  // common two-qubit gates used throughout quantum circuit design.

  /** 2×2 identity — "do nothing" gate. */
  static readonly I_2: Matrix = new Matrix([[1, 0], [0, 1]]);

  /** Pauli-X (NOT gate) — flips |0⟩↔|1⟩. */
  static readonly X: Matrix = new Matrix([[0, 1], [1, 0]]);

  /**
   * Pauli-Y — combines a bit-flip with a phase flip.
   * Y = [[0, −i], [i, 0]]
   */
  static readonly Y: Matrix = new Matrix([
    [0, Complex.i.neg()],
    [Complex.i, 0],
  ]);

  /** Pauli-Z — phase flip; maps |1⟩ → −|1⟩. */
  static readonly Z: Matrix = new Matrix([[1, 0], [0, -1]]);

  /**
   * Hadamard gate — creates superposition: |0⟩ → (|0⟩+|1⟩)/√2.
   * H = (1/√2) [[1, 1], [1, −1]]
   */
  static readonly H: Matrix = new Matrix([[1, 1], [1, -1]]).mul(
    1 / Math.SQRT2,
  ) as Matrix;

  /** Phase gate S — applies a π/2 phase to |1⟩. */
  static readonly S: Matrix = new Matrix([[1, 0], [0, Complex.i]]);

  /**
   * T gate — applies a π/4 phase (e^{iπ/4} = (1+i)/√2) to |1⟩.
   * Together with H and CNOT, {H, T, CNOT} forms a universal gate set.
   */
  static readonly T: Matrix = new Matrix([
    [1, 0],
    [0, new Complex(1 / Math.SQRT2, 1 / Math.SQRT2)],
  ]);

  /** CNOT with qubit 0 as control, qubit 1 as target. */
  static readonly CX: Matrix = new Matrix([
    [1, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
  ]);

  /** CNOT with qubit 1 as control, qubit 0 as target. */
  static readonly XC: Matrix = new Matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 0],
  ]);

  /** Two-qubit SWAP gate. */
  static readonly SWAP_2: Matrix = new Matrix([
    [1, 0, 0, 0],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 1],
  ]);
}


// ─── qubitWiseMultiply ───────────────────────────────────────────────────────

/**
 * Applies a single-qubit unitary U to wire `i_w` of an n-qubit state vector,
 * optionally conditioned on a set of control / anti-control bits.
 *
 * Algorithm (MTI882-01 lecture 3, p. 32)
 * ──────────────────────────────────────
 * The 2ⁿ-element state vector is viewed as a collection of 2×1 sub-vectors,
 * one per pair of computational-basis states that differ only in qubit i_w.
 * U is applied independently to each such pair, UNLESS the remaining bits
 * fail the control mask test.
 *
 * Control bit encoding
 * ────────────────────
 * Each ControlBit = [wireIndex, flag] contributes one bit to two masks:
 *   inclusionMask     – which wires are tested
 *   desiredValueMask  – which of those must be |1⟩ (flag=true) vs |0⟩ (flag=false)
 * A basis state index `i1` passes the test iff:
 *   (i1 & inclusionMask) === desiredValueMask
 *
 * @param U              2×2 gate matrix
 * @param i_w            Target wire index  (0 = least-significant bit)
 * @param n              Total number of qubits
 * @param a              State vector as a (2ⁿ)×1 column matrix
 * @param listOfControlBits  Optional list of control / anti-control descriptors
 * @returns              New state vector after applying U
 */
export function qubitWiseMultiply(
  U: Matrix,
  i_w: number,
  n: number,
  a: Matrix,
  listOfControlBits?: ControlBit[],
): Matrix {
  let inclusionMask = 0;
  let desiredValueMask = 0;

  if (listOfControlBits !== undefined) {
    for (const [wireIndex, flag] of listOfControlBits) {
      const bit = 2 ** wireIndex;
      inclusionMask |= bit;
      if (flag) desiredValueMask |= bit;
    }
  }

  const sizeOfStateVector = 2 ** n;
  const sizeOfHalfBlock = 2 ** i_w;
  const sizeOfBlock = 2 * sizeOfHalfBlock;

  const aNew = a.deepCopy();
  const Um = U.m;   // direct buffer access for performance
  const am = a.m;
  const anm = aNew.m;

  for (let b0 = 0; b0 < sizeOfStateVector; b0 += sizeOfBlock) {
    for (let offset = 0; offset < sizeOfHalfBlock; offset++) {
      const i1 = b0 + offset;
      if ((i1 & inclusionMask) !== desiredValueMask) continue;
      const i2 = i1 + sizeOfHalfBlock;

      // Apply the 2×2 unitary to the (i1, i2) amplitude pair
      anm[i1][0] = Um[0][0].mul(am[i1][0]).add(Um[0][1].mul(am[i2][0]));
      anm[i2][0] = Um[1][0].mul(am[i1][0]).add(Um[1][1].mul(am[i2][0]));
    }
  }

  return aNew;
}


// ─── Standard computational basis states ─────────────────────────────────────

export function initStateToKet(state: InitState): Matrix {
  switch (state) {
    case "0": return ketZero;
    case "1": return ketOne;
    case "+": return ketPlus;
    case "-": return ketMinus;
    case "i": return ketI;
    case "-i": return ketMinusI;
  }
}

const s = 1 / Math.SQRT2;
export const ketZero: Matrix = new Matrix([[1], [0]]);
export const ketOne: Matrix = new Matrix([[0], [1]]);
export const ketPlus: Matrix = new Matrix([[s], [s]]);
export const ketMinus: Matrix = new Matrix([[s], [-s]]);
export const ketI: Matrix = new Matrix([[s], [new Complex(0, s)]]);
export const ketMinusI: Matrix = new Matrix([[s], [new Complex(0, -s)]]);
