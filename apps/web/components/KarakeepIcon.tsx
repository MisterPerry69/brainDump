// BrainDump: logo "BD//" (blocco arancio smussato) al posto del logo Karakeep.
export default function KarakeepLogo({ height }: { height: number }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="bd-cfs flex items-center bg-primary px-[0.45em] font-black tracking-tight text-primary-foreground"
        style={{ height: height * 0.6, fontSize: height * 0.36 }}
      >
        BD//
      </span>
      <span
        className="font-black tracking-tight text-foreground"
        style={{ fontSize: height * 0.36 }}
      >
        BrainDump
      </span>
    </span>
  );
}
