import { Abstract } from "lamina/vanilla";
import fragmentShader from "./fragment.glsl";
import vertexShader from "./vertex.glsl";

class CustomLayer extends Abstract {
  // Define stuff as static properties!

  // Uniforms: Must begin with prefix "u_".
  // Assign them their default value.
  // Any unifroms here will automatically be set as properties on the class as setters and getters.
  // There setters and getters will update the underlying unifrom.
  static u_time = 0.0;
  static fragmentShader = fragmentShader;
  static vertexShader = vertexShader;

  constructor(props) {
    // You MUST call 'super' with the current constructor as the first argument.
    // Second argument is optional and provides non-uniform parameters like blend mode, name and visibility.
    super(CustomLayer, {
      name: "CustomLayer",
      ...props,
    });
  }
}

export default CustomLayer;
