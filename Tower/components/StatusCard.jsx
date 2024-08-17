import { StyleSheet } from "react-native";
import { Card, Paragraph } from "react-native-paper";
import Theme from "@/styles/Theme";

const StatusCard = ({ message }) => {
  return (
    <Card style={styles.statusCard}>
      <Card.Content>
        <Paragraph>{message}</Paragraph>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  statusCard: {
    marginVertical: Theme.margin.sm,
    backgroundColor: Theme.colors.secondary,
    padding: Theme.padding.md,
    borderRadius: Theme.radius.md,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default StatusCard;
