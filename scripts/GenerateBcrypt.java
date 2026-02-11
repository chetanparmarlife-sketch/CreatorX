public class GenerateBcrypt {
    public static void main(String[] args) {
        String password = args.length > 0 ? args[0] : "admin123";
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder enc =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(10);
        System.out.println(enc.encode(password));
    }
}
