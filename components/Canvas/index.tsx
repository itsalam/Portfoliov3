import { Canvas as RCanvas } from "@react-three/fiber";
import { motion } from "framer-motion-3d";

export default function Canvas() {
  return (
    <RCanvas className="w-full h-full">
      <motion.group>
        <motion.mesh variants={{ hover: { z: 1 } }} />
      </motion.group>
    </RCanvas>
  );
}
