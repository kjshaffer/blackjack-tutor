type Props = {
  rank: string;
  suit: string;
  hidden?: boolean;
};

const suitColors: Record<string, string> = {
  "♠": "text-gray-900",
  "♣": "text-gray-900",
  "♥": "text-red-600",
  "♦": "text-red-600",
};

export default function PlayingCard({ rank, suit, hidden }: Props) {
  if (hidden) {
    return (
      <div className="w-24 h-36 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-blue-600 shadow-lg flex items-center justify-center">
        <div className="text-blue-400 text-3xl">?</div>
      </div>
    );
  }

  return (
    <div className="w-24 h-36 rounded-xl bg-white border border-gray-200 shadow-lg flex flex-col justify-between p-2 select-none">
      <div className={`text-lg font-bold leading-none ${suitColors[suit]}`}>
        {rank}
        <br />
        {suit}
      </div>
      <div className={`text-3xl self-center ${suitColors[suit]}`}>{suit}</div>
      <div className={`text-lg font-bold leading-none self-end rotate-180 ${suitColors[suit]}`}>
        {rank}
        <br />
        {suit}
      </div>
    </div>
  );
}