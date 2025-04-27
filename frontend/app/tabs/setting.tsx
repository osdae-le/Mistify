import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import WeeklyChart from "../../components/layouts/WeeklyChart";
import CityCard from "../../components/layouts/CityCard";
import LineChartCard from "../../components/layouts/LineChart";
import SettingTab from "../../components/layouts/TabSetting";
import SettingCard from "../../components/layouts/CardSetting";
import HumidityGauge from "../../components/layouts/HumidityGauge";
import ScheduleModal from "../../components/modals/ScheduleModal";
import ConditionsModal from "../../components/modals/ConditionalModal";
import { fetchChartData } from "../../utils/fetchChartData";
import { getWeeklyAverage } from "../../utils/getWeeklyAvg";
import useRealtimeValue from "../../hook/useRealtimeValue";
import { saveEnvironmentConditions } from "../../utils/saveEnvironmentConditions";
import { useEnvironmentAutoController } from "../../hook/useEnvironmentAutoController";
import { saveSchedule } from "../../utils/saveSchedule";

type ChartDataPoint = {
  time: string;
  value: number;
};

export default function SettingScreen() {
  useEnvironmentAutoController(); 

  const [selectedTab, setSelectedTab] = useState("Setting");

  const [temperatureData, setTemperatureData] = useState<ChartDataPoint[]>([]);
  const [brightnessData, setBrightnessData] = useState<ChartDataPoint[]>([]);
  const [humidityData, setHumidityData] = useState<ChartDataPoint[]>([]);

  const [weeklyTempData, setWeeklyTempData] = useState<number[]>([]);
  const [weeklyLightData, setWeeklyLightData] = useState<number[]>([]);
  const [weeklyHumidityData, setWeeklyHumidityData] = useState<number[]>([]);

  const latestTemp = useRealtimeValue("temperatureData");
  const latestHumid = useRealtimeValue("humidityData");
  const latestLight = useRealtimeValue("lightData");

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [conditionsModalVisible, setConditionsModalVisible] = useState(false);

  const handleScheduleDetails = () => setScheduleModalVisible(true);
  const handleSetConditions = () => setConditionsModalVisible(true);

  useEffect(() => {
    const loadChartData = async () => {
      const temp = await fetchChartData("temperatureData", 12);
      const light = await fetchChartData("lightData", 12);
      const humid = await fetchChartData("humidityData", 12);

      const weeklyTempAvg = await getWeeklyAverage("temperatureData");
      const weeklyLightAvg = await getWeeklyAverage("lightData");
      const weeklyHumidAvg = await getWeeklyAverage("humidityData");

      setTemperatureData(temp);
      setBrightnessData(light);
      setHumidityData(humid);

      setWeeklyTempData(weeklyTempAvg);
      setWeeklyLightData(weeklyLightAvg);
      setWeeklyHumidityData(weeklyHumidAvg);
    };

    loadChartData();
  }, []);

  return (
    <View style={styles.container}>
      <SettingTab onSelect={setSelectedTab} />

      {selectedTab === "Setting" && (
        <ScrollView contentContainerStyle={styles.content}>
          <SettingCard
            title="Manual Control"
            description="Turn on/off without conditions."
            mode="manual_control"
          />
          <SettingCard
            title="Scheduler Spraying"
            description="Based on preset scheduler."
            buttonText="Schedule Details"
            mode="scheduler_spraying"
            onPressButton={handleScheduleDetails}
          />
          <SettingCard
            title="Environment Auto"
            description="Based on temperature, humidity, light."
            buttonText="Set Conditions"
            mode="environment_auto"
            onPressButton={handleSetConditions}
          />
          <SettingCard
            title="Artificial Intelligence"
            description="Based on AI Model."
            mode="ai_control"
          />
        </ScrollView>
      )}

      {selectedTab === "Temperature" && (
        <ScrollView contentContainerStyle={styles.content}>
          <LineChartCard
            title="Temperature Chart"
            labels={temperatureData.map((item, index) =>
              index % 3 === 0 ? item.time : ""
            )}
            datasets={[{ data: temperatureData.map((item) => item.value) }]}
          />
          <CityCard valueText={`${latestTemp ?? "--"} °C`} />
          <WeeklyChart
            title="Weekly Average Temperature"
            datasets={[{ data: weeklyTempData }]}
          />
        </ScrollView>
      )}

      {selectedTab === "Humidity" && (
        <ScrollView contentContainerStyle={styles.content}>
          <HumidityGauge humidity={latestHumid ?? undefined} />
          <CityCard valueText={`${latestHumid ?? "--"} %`} />
          <WeeklyChart
            title="Weekly Average Humidity"
            datasets={[{ data: weeklyHumidityData }]}
          />
        </ScrollView>
      )}

      {selectedTab === "Brightness" && (
        <ScrollView contentContainerStyle={styles.content}>
          <LineChartCard
            title="Light Intensity Chart"
            labels={brightnessData.map((item, index) =>
              index % 3 === 0 ? item.time : ""
            )}
            datasets={[{ data: brightnessData.map((item) => item.value) }]}
          />
          <CityCard valueText={`${latestLight ?? "--"} lux`} />
          <WeeklyChart
            title="Weekly Average Light Intensity"
            datasets={[{ data: weeklyLightData }]}
          />
        </ScrollView>
      )}

      {/* Modals */}
      <ScheduleModal
        visible={scheduleModalVisible}
        onClose={() => setScheduleModalVisible(false)}
        onSave={async (startTime, endTime, days) => {
          try {
            await saveSchedule(startTime, endTime, days);
            console.log("✅ Schedule saved successfully!");
            setScheduleModalVisible(false); // Đóng modal sau khi lưu thành công
          } catch (error) {
            console.error("❌ Failed to save schedule!", error);
          }
        }}
      />
      <ConditionsModal
        visible={conditionsModalVisible}
        onClose={() => setConditionsModalVisible(false)}
        onSave={async (conditions) => {
          try {
            await saveEnvironmentConditions(conditions);
            console.log("✅ Conditions saved successfully!", conditions);
            setConditionsModalVisible(false);
          } catch (error) {
            console.error("❌ Failed to save conditions!", error);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    marginTop: 40,
  },
  content: {
    marginTop: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
});
