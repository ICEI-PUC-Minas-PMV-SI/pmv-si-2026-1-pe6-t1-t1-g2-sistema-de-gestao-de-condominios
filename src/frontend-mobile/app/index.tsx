import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { exchangeSocialCode, loginUser } from "@/services/auth";
import { setAuthToken } from "@/services/authSession";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

const COLORS = {
  bg: "#F8FAFC",
  primary: "#243B6B",
  text: "#1A1A1A",
  muted: "#666666",
  white: "#FFFFFF",
  inputBg: "#F4F7FA",
  line: "#E8ECF2",
};

const TRUST_AVATARS = [
  "https://api.dicebear.com/9.x/personas/png?seed=Condo-A",
  "https://api.dicebear.com/9.x/personas/png?seed=Condo-B",
  "https://api.dicebear.com/9.x/personas/png?seed=Condo-C",
];

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSocialSuccess = () => {
    router.replace("/(tabs)");
  };

  async function handleLogin() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !senha.trim()) {
      setFeedback("Informe e-mail e senha para continuar.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const authResult = await loginUser({
        email: normalizedEmail,
        password: senha,
      });

      setAuthToken(authResult.token);

      router.replace("/(tabs)");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heroGradientA} />
            <View style={styles.heroGradientB} />
            <View style={styles.logoPill}>
              <Ionicons name="business-outline" size={18} color={COLORS.primary} />
              <Text style={styles.logoText}>CONDOMINIO</Text>
            </View>
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.title}>
              Bem-vindo{"\n"}ao <Text style={styles.titleAccent}>Condominio.</Text>
            </Text>
            <Text style={styles.subtitle}>
              Vivencie a gestao condominial como um santuario digital. Simples,
              fluido e projetado para sua paz de espirito.
            </Text>

            <View style={styles.trustRow}>
              <View style={styles.avatarRow}>
                {TRUST_AVATARS.map((uri, index) => (
                  <Image
                    key={uri}
                    source={{ uri }}
                    style={[
                      styles.avatar,
                      index > 0 ? styles.avatarOverlap : undefined,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.trustText}>JUNTE-SE A +2.000 CONDOMINIOS</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Entrar na plataforma</Text>
              <Text style={styles.cardSubtitle}>
                Insira seus dados para acessar sua conta.
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Senha</Text>
                <Pressable>
                  <Text style={styles.forgot}>Esqueceu?</Text>
                </Pressable>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!senhaVisivel}
                  autoCapitalize="none"
                />
                <Pressable
                  hitSlop={8}
                  onPress={() => setSenhaVisivel((prev) => !prev)}
                >
                  <Ionicons
                    name={senhaVisivel ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#94A3B8"
                  />
                </Pressable>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submit, isSubmitting ? styles.submitDisabled : null]}
              activeOpacity={0.92}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.submitText}>Acessar conta</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>

            {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU CONTINUE COM</Text>
              <View style={styles.dividerLine} />
            </View>

            <SocialAuthButtons
              mode="login"
              onSuccess={handleSocialSuccess}
              onMessage={setFeedback}
            />

            <View style={styles.signupRow}>
              <Text style={styles.signupMuted}>Novo por aqui? </Text>
              <TouchableOpacity onPress={() => router.push("/cadastro")}> 
                <Text style={styles.signupLink}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerLink}>TERMOS DE USO</Text>
            <View style={styles.footerDot} />
            <Text style={styles.footerLink}>PRIVACIDADE</Text>
            <View style={styles.footerDot} />
            <Text style={styles.footerLink}>SUPORTE</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 24,
  },
  hero: {
    width: "100%",
    height: 220,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  heroGradientA: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 999,
    backgroundColor: "#D5E2FB",
    opacity: 0.8,
    top: -210,
    left: -40,
  },
  heroGradientB: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "#BFD1F5",
    opacity: 0.45,
    top: -160,
    right: -20,
  },
  logoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  logoText: {
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: "800",
    color: COLORS.primary,
  },
  welcomeContainer: {
    width: "100%",
    maxWidth: 420,
    paddingHorizontal: 30,
    marginTop: 6,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    color: COLORS.text,
  },
  titleAccent: {
    color: COLORS.primary,
  },
  subtitle: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.muted,
  },
  trustRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarRow: {
    flexDirection: "row",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  trustText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: COLORS.muted,
    flex: 1,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 38,
    padding: 28,
    marginTop: 22,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 2,
  },
  forgot: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },
  inputWrapper: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 14,
    color: COLORS.text,
  },
  submit: {
    marginTop: 6,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
  },
  submitDisabled: {
    opacity: 0.72,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },
  feedbackText: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: "#B42318",
    textAlign: "center",
  },
  dividerRow: {
    marginVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.line,
  },
  dividerText: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: "#94A3B8",
    fontWeight: "700",
  },
  socialGrid: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.inputBg,
  },
  signupRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupMuted: {
    fontSize: 13,
    color: COLORS.muted,
  },
  signupLink: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    borderBottomColor: COLORS.primary,
    borderBottomWidth: 2,
    paddingBottom: 1,
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
  },
  footerLink: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#9CA3AF",
  },
});


type SocialAuthButtonsProps = {
  mode: "login" | "signup";
  onSuccess: () => void;
  onMessage: (message: string) => void;
};

function SocialAuthButtons({ mode, onSuccess, onMessage }: SocialAuthButtonsProps) {
  const [isBusy, setIsBusy] = useState(false);

  const googleConfig = useMemo(() => {
    if (!GOOGLE_CLIENT_ID) {
      return null;
    }

    return {
      clientId: GOOGLE_CLIENT_ID,
      webClientId: GOOGLE_CLIENT_ID,
      iosClientId: GOOGLE_CLIENT_ID,
      androidClientId: GOOGLE_CLIENT_ID,
      responseType: AuthSession.ResponseType.Code,
      shouldAutoExchangeCode: false,
      scopes: ["openid", "profile", "email"],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: "condominio",
        path: "oauthredirect",
      }),
    };
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest(
    googleConfig ?? {
      clientId: "placeholder-google-client-id",
      webClientId: "placeholder-google-client-id",
      responseType: AuthSession.ResponseType.Code,
      shouldAutoExchangeCode: false,
      scopes: ["openid", "profile", "email"],
      redirectUri: AuthSession.makeRedirectUri({ scheme: "condominio", path: "oauthredirect" }),
    },
  );

  useEffect(() => {
    if (response?.type !== "success") {
      if (response?.type === "dismiss" || response?.type === "cancel") {
        setIsBusy(false);
      }
      return;
    }

    const code = response.params.code;
    if (!code) {
      onMessage("O provedor social não retornou o código de autorização.");
      setIsBusy(false);
      return;
    }

    if (!request?.codeVerifier) {
      onMessage("Não foi possível gerar o verificador de segurança do login social.");
      setIsBusy(false);
      return;
    }

    exchangeSocialCode({
      provider: "google",
      code,
      codeVerifier: request.codeVerifier,
      redirectUri: request.redirectUri,
    })
      .then((result) => {
        setAuthToken(result.token);
        onMessage("");
        onSuccess();
      })
      .catch((error) => {
        onMessage(error instanceof Error ? error.message : "Falha no login social do Google.");
      })
      .finally(() => {
        setIsBusy(false);
      });
  }, [onMessage, onSuccess, request?.codeVerifier, request?.redirectUri, response]);

  async function handleGooglePress() {
    if (!GOOGLE_CLIENT_ID) {
      onMessage("Configure EXPO_PUBLIC_GOOGLE_CLIENT_ID para usar login social do Google.");
      return;
    }

    if (!request) {
      onMessage("Carregando configuração do Google... tente novamente em instantes.");
      return;
    }

    setIsBusy(true);
    onMessage("");

    try {
      await promptAsync();
    } catch (error) {
      setIsBusy(false);
      onMessage(error instanceof Error ? error.message : "Não foi possível iniciar o login do Google.");
    }
  }

  function handleApplePress() {
    onMessage("Login com Apple ainda não está configurado no backend.");
  }

  return (
    <View style={mode === "login" ? styles.socialGrid : styles.socialGrid}>
      <TouchableOpacity
        style={styles.socialButton}
        activeOpacity={0.88}
        onPress={handleGooglePress}
        disabled={isBusy}
      >
        {isBusy ? (
          <ActivityIndicator size="small" color="#334155" />
        ) : (
          <Ionicons name="logo-google" size={20} color="#334155" />
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialButton} activeOpacity={0.88} onPress={handleApplePress}>
        <Ionicons name="logo-apple" size={20} color="#334155" />
      </TouchableOpacity>
    </View>
  );
}
