import Image from "next/image";

const GRADIENTS = [
  "from-orange-200 to-amber-100",
  "from-emerald-200 to-teal-100",
  "from-sky-200 to-cyan-100",
  "from-rose-200 to-pink-100",
  "from-violet-200 to-indigo-100",
];

function gradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % GRADIENTS.length;
  }
  return GRADIENTS[hash];
}

export function MealImage({
  name,
  imageUrl,
  className = "",
}: {
  name: string;
  imageUrl: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={400}
        height={300}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-3xl font-semibold text-black/30 dark:text-black/40 ${gradientFor(name)} ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
