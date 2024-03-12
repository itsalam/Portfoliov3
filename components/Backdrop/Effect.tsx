import { motion } from "framer-motion";

const Effect = () => {
  return (
    <motion.div className="absolute w-screen h-screen top-0 opacity-50">
      <motion.div className="absolute backdrop w-screen h-screen overflow-hidden bg-[--jade-2]">
        <motion.div className="mouse-effect rounded-full w-g-x-3 aspect-square absolute top-0 left-0 " />
      </motion.div>
    </motion.div>
  );
};

export default Effect;
