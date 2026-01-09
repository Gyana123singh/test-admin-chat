export default function CoinPackageCard({ pkg, onBuy }) {
  return (
    <div className="package">
      <div>
        <h3>{pkg.totalCoins} Coins</h3>
        {pkg.bonusCoins > 0 && (
          <span className="bonus">Bonus: {pkg.bonusCoins}</span>
        )}
      </div>

      <button onClick={() => onBuy(pkg)}>
        ₹{pkg.amount}
      </button>
    </div>
  );
}
