import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldType = 'text' | 'number' | 'dropdown' | 'boolean' | 'unit';

interface FieldSchema {
  label: string;
  field_type: FieldType;
  unit: string;
  options: string[];
  required: boolean;
}

interface CatalogNode {
  id: string;
  name: string;
  parent_id: string | null;
  field_schema: FieldSchema[];
}

interface CatalogLevel {
  level_index: number;
  level_name: string;
  nodes: CatalogNode[];
}

interface TopCategory {
  name: string;
  icon: string;
  is_preset: boolean;
}

// ─── Presets (top-level suggestions only, no sub-categories) ─────────────────

const PRESET_TOP_CATEGORIES = [
  { name: 'Furniture', icon: 'bed-outline' },
  { name: 'Electronics', icon: 'tv-outline' },
  { name: 'Electrical', icon: 'flash-outline' },
  { name: 'Plumbing', icon: 'water-outline' },
  { name: 'Hardware', icon: 'construct-outline' },
  { name: 'Textiles', icon: 'shirt-outline' },
  { name: 'Food & Grocery', icon: 'basket-outline' },
  { name: 'Automotive', icon: 'car-outline' },
];

const FIELD_TYPES: { value: FieldType; label: string; icon: string }[] = [
  { value: 'text', label: 'Text', icon: 'text-outline' },
  { value: 'number', label: 'Number', icon: 'calculator-outline' },
  { value: 'dropdown', label: 'Dropdown', icon: 'chevron-down-circle-outline' },
  { value: 'boolean', label: 'Yes / No', icon: 'toggle-outline' },
  { value: 'unit', label: 'With Unit', icon: 'scale-outline' },
];

const COMMON_UNITS = ['kg', 'g', 'lbs', 'cm', 'm', 'mm', 'ft', 'inch', 'litre', 'ml', 'pcs', 'set', '%', '°C'];

function genId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={si.row}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <View style={[si.dot, i < current && si.dotDone, i === current && si.dotActive]}>
            {i < current ? (
              <Ionicons name="checkmark" size={12} color="#fff" />
            ) : (
              <Text style={[si.dotText, i === current && si.dotTextActive]}>{i + 1}</Text>
            )}
          </View>
          {i < total - 1 && <View style={[si.line, i < current && si.lineDone]} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const si = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5EAF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  dotDone: { backgroundColor: Colors.success },
  dotText: { fontSize: 11, fontFamily: 'Inter_700Bold', color: Colors.textMuted },
  dotTextActive: { color: '#fff' },
  line: { width: 32, height: 2, backgroundColor: '#E5EAF5' },
  lineDone: { backgroundColor: Colors.success },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function CatalogSetupScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // 0..3

  // Step 1 state
  const [topCategory, setTopCategory] = useState<TopCategory | null>(null);
  const [customCatName, setCustomCatName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Step 2 state
  const [levels, setLevels] = useState<CatalogLevel[]>([]);
  const [addingNodeForLevel, setAddingNodeForLevel] = useState<number | null>(null);
  const [addingNodeParentId, setAddingNodeParentId] = useState<string | null>(null);
  const [newNodeName, setNewNodeName] = useState('');
  const [editingNode, setEditingNode] = useState<{ levelIndex: number; nodeId: string } | null>(null);
  const [editNodeName, setEditNodeName] = useState('');
  const [newLevelName, setNewLevelName] = useState('');
  const [showAddLevel, setShowAddLevel] = useState(false);

  // Step 3 state
  const [selectedLeafNode, setSelectedLeafNode] = useState<CatalogNode | null>(null);
  const [selectedLeafLevelIdx, setSelectedLeafLevelIdx] = useState<number>(0);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [fieldUnit, setFieldUnit] = useState('');
  const [fieldOptions, setFieldOptions] = useState('');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getLeafNodes = (): { node: CatalogNode; levelIndex: number }[] => {
    if (levels.length === 0) return [];
    const lastLevel = levels[levels.length - 1];
    return lastLevel.nodes.map((n) => ({ node: n, levelIndex: lastLevel.level_index }));
  };

  const getChildNodes = (levelIndex: number, parentId: string | null): CatalogNode[] => {
    const level = levels.find((l) => l.level_index === levelIndex);
    if (!level) return [];
    if (parentId === null) return level.nodes.filter((n) => n.parent_id === null);
    return level.nodes.filter((n) => n.parent_id === parentId);
  };

  const updateNodeFieldSchema = (levelIndex: number, nodeId: string, schema: FieldSchema[]) => {
    setLevels((prev) =>
      prev.map((l) => {
        if (l.level_index !== levelIndex) return l;
        return {
          ...l,
          nodes: l.nodes.map((n) => (n.id === nodeId ? { ...n, field_schema: schema } : n)),
        };
      })
    );
  };

  // ── Step 1 Handlers ──────────────────────────────────────────────────────

  const handleSelectPreset = (preset: { name: string; icon: string }) => {
    setTopCategory({ name: preset.name, icon: preset.icon, is_preset: true });
    setShowCustomInput(false);
    setCustomCatName('');
  };

  const handleSelectOther = () => {
    setTopCategory(null);
    setShowCustomInput(true);
  };

  const handleConfirmCustom = () => {
    if (!customCatName.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }
    setTopCategory({ name: customCatName.trim(), icon: 'grid-outline', is_preset: false });
  };

  // ── Step 2 Handlers ──────────────────────────────────────────────────────

  const handleAddLevel = () => {
    if (!newLevelName.trim()) {
      Alert.alert('Error', 'Please enter a level name.');
      return;
    }
    const newLevel: CatalogLevel = {
      level_index: levels.length,
      level_name: newLevelName.trim(),
      nodes: [],
    };
    setLevels([...levels, newLevel]);
    setNewLevelName('');
    setShowAddLevel(false);
  };

  const handleDeleteLevel = (levelIndex: number) => {
    Alert.alert(
      'Delete Level',
      `Delete level "${levels[levelIndex]?.level_name}"? All nodes inside will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Remove this level and deeper levels; re-index
            const newLevels = levels
              .filter((l) => l.level_index < levelIndex)
              .map((l, i) => ({ ...l, level_index: i }));
            setLevels(newLevels);
          },
        },
      ]
    );
  };

  const handleAddNode = (levelIndex: number, parentId: string | null) => {
    setAddingNodeForLevel(levelIndex);
    setAddingNodeParentId(parentId);
    setNewNodeName('');
  };

  const handleConfirmAddNode = () => {
    if (!newNodeName.trim()) {
      Alert.alert('Error', 'Please enter a name.');
      return;
    }
    const node: CatalogNode = {
      id: genId(),
      name: newNodeName.trim(),
      parent_id: addingNodeParentId,
      field_schema: [],
    };
    setLevels((prev) =>
      prev.map((l) =>
        l.level_index === addingNodeForLevel ? { ...l, nodes: [...l.nodes, node] } : l
      )
    );
    setAddingNodeForLevel(null);
    setAddingNodeParentId(null);
    setNewNodeName('');
  };

  const handleStartEditNode = (levelIndex: number, nodeId: string, currentName: string) => {
    setEditingNode({ levelIndex, nodeId });
    setEditNodeName(currentName);
  };

  const handleConfirmEditNode = () => {
    if (!editNodeName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    if (!editingNode) return;
    setLevels((prev) =>
      prev.map((l) => {
        if (l.level_index !== editingNode.levelIndex) return l;
        return {
          ...l,
          nodes: l.nodes.map((n) =>
            n.id === editingNode.nodeId ? { ...n, name: editNodeName.trim() } : n
          ),
        };
      })
    );
    setEditingNode(null);
    setEditNodeName('');
  };

  const handleDeleteNode = (levelIndex: number, nodeId: string, nodeName: string) => {
    Alert.alert('Delete Node', `Delete "${nodeName}"? Its children will also be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // Collect all descendant IDs
          const collectDescendants = (id: string): string[] => {
            let ids = [id];
            levels.forEach((l) => {
              l.nodes.forEach((n) => {
                if (n.parent_id === id) ids = [...ids, ...collectDescendants(n.id)];
              });
            });
            return ids;
          };
          const toRemove = new Set(collectDescendants(nodeId));
          setLevels((prev) =>
            prev.map((l) => ({ ...l, nodes: l.nodes.filter((n) => !toRemove.has(n.id)) }))
          );
        },
      },
    ]);
  };

  // ── Step 3 Handlers ──────────────────────────────────────────────────────

  const openFieldModal = (leaf: CatalogNode, levelIndex: number, fieldIdx?: number) => {
    setSelectedLeafNode(leaf);
    setSelectedLeafLevelIdx(levelIndex);
    if (fieldIdx !== undefined) {
      const f = leaf.field_schema[fieldIdx];
      setFieldLabel(f.label);
      setFieldType(f.field_type);
      setFieldUnit(f.unit || '');
      setFieldOptions((f.options || []).join(', '));
      setFieldRequired(f.required);
      setEditingFieldIndex(fieldIdx);
    } else {
      setFieldLabel('');
      setFieldType('text');
      setFieldUnit('');
      setFieldOptions('');
      setFieldRequired(false);
      setEditingFieldIndex(null);
    }
    setShowFieldModal(true);
  };

  const handleSaveField = () => {
    if (!fieldLabel.trim()) {
      Alert.alert('Error', 'Field label cannot be empty.');
      return;
    }
    if (!selectedLeafNode) return;

    const newField: FieldSchema = {
      label: fieldLabel.trim(),
      field_type: fieldType,
      unit: fieldUnit.trim(),
      options: fieldOptions
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
      required: fieldRequired,
    };

    const updatedSchema =
      editingFieldIndex !== null
        ? selectedLeafNode.field_schema.map((f, i) => (i === editingFieldIndex ? newField : f))
        : [...selectedLeafNode.field_schema, newField];

    const updatedNode = { ...selectedLeafNode, field_schema: updatedSchema };
    updateNodeFieldSchema(selectedLeafLevelIdx, selectedLeafNode.id, updatedSchema);
    setSelectedLeafNode(updatedNode);
    setShowFieldModal(false);
  };

  const handleDeleteField = (leaf: CatalogNode, levelIndex: number, fieldIdx: number) => {
    const updated = leaf.field_schema.filter((_, i) => i !== fieldIdx);
    updateNodeFieldSchema(levelIndex, leaf.id, updated);
    setSelectedLeafNode((prev) => (prev ? { ...prev, field_schema: updated } : null));
  };

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!topCategory) return;
    setIsSaving(true);
    try {
      // TODO: Replace with real API call using auth token
      // const response = await fetch('http://your-server/api/catalog/structure/save/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      //   body: JSON.stringify({ top_category: topCategory, levels }),
      // });
      // if (!response.ok) throw new Error('Save failed');
      await new Promise((r) => setTimeout(r, 1200)); // Simulated API call
      Alert.alert('Success! 🎉', 'Your product structure has been saved.', [
        { text: 'OK', onPress: () => router.replace('/(seller)/(tabs)') },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save structure. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Navigation ───────────────────────────────────────────────────────────

  const canGoNext = () => {
    if (currentStep === 0) return !!topCategory;
    if (currentStep === 1) return levels.length > 0;
    return true;
  };

  const goNext = () => {
    if (!canGoNext()) {
      if (currentStep === 0) Alert.alert('Choose a Category', 'Please select or create a top-level category.');
      if (currentStep === 1) Alert.alert('Add a Level', 'Please add at least one level to your hierarchy.');
      return;
    }
    if (currentStep < 3) setCurrentStep((s) => s + 1);
    else handleSave();
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    else router.back();
  };

  // ── Renders ──────────────────────────────────────────────────────────────

  const STEP_TITLES = [
    'Choose Category',
    'Build Hierarchy',
    'Define Fields',
    'Review & Save',
  ];

  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
      <Text style={styles.stepHeading}>What do you sell?</Text>
      <Text style={styles.stepSub}>
        Select or create the top-level category for your shop. You can build sub-levels in the next step.
      </Text>

      <View style={styles.presetGrid}>
        {PRESET_TOP_CATEGORIES.map((preset) => {
          const isSelected = topCategory?.name === preset.name && topCategory?.is_preset;
          return (
            <TouchableOpacity
              key={preset.name}
              style={[styles.presetCard, isSelected && styles.presetCardSelected]}
              onPress={() => handleSelectPreset(preset)}
              activeOpacity={0.75}
            >
              <View style={[styles.presetIconBg, isSelected && styles.presetIconBgSelected]}>
                <Ionicons name={preset.icon as any} size={28} color={isSelected ? '#fff' : Colors.primary} />
              </View>
              <Text style={[styles.presetName, isSelected && styles.presetNameSelected]}>
                {preset.name}
              </Text>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Other Option */}
        <TouchableOpacity
          style={[styles.presetCard, showCustomInput && styles.presetCardSelected]}
          onPress={handleSelectOther}
          activeOpacity={0.75}
        >
          <View style={[styles.presetIconBg, showCustomInput && styles.presetIconBgSelected]}>
            <Ionicons name="add-circle-outline" size={28} color={showCustomInput ? '#fff' : Colors.amber} />
          </View>
          <Text style={[styles.presetName, showCustomInput && styles.presetNameSelected]}>Other</Text>
        </TouchableOpacity>
      </View>

      {showCustomInput && (
        <View style={styles.customInputWrapper}>
          <Text style={styles.formLabel}>Enter your category name</Text>
          <View style={styles.customInputRow}>
            <TextInput
              style={styles.customInput}
              placeholder="e.g. Stationery, Jewellery…"
              placeholderTextColor={Colors.textMuted}
              value={customCatName}
              onChangeText={setCustomCatName}
              autoFocus
            />
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmCustom}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {topCategory && !topCategory.is_preset && (
            <View style={styles.confirmedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.confirmedText}>"{topCategory.name}" selected</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderNodeTree = (levelIndex: number, parentId: string | null, depth: number = 0) => {
    const level = levels.find((l) => l.level_index === levelIndex);
    if (!level) return null;
    const nodes = level.nodes.filter((n) => n.parent_id === parentId);

    return (
      <View style={{ marginLeft: depth > 0 ? 16 : 0 }}>
        {nodes.map((node, idx) => {
          const isEditing = editingNode?.levelIndex === levelIndex && editingNode?.nodeId === node.id;
          const hasNextLevel = levelIndex < levels.length - 1;
          return (
            <View key={node.id}>
              <View style={styles.nodeRow}>
                {depth > 0 && (
                  <View style={styles.treeLines}>
                    <View style={styles.treeLV} />
                    <View style={styles.treeLH} />
                  </View>
                )}
                <View style={styles.nodeContent}>
                  {isEditing ? (
                    <View style={styles.nodeEditRow}>
                      <TextInput
                        style={styles.nodeEditInput}
                        value={editNodeName}
                        onChangeText={setEditNodeName}
                        autoFocus
                        onSubmitEditing={handleConfirmEditNode}
                      />
                      <TouchableOpacity onPress={handleConfirmEditNode} style={styles.nodeEditConfirm}>
                        <Ionicons name="checkmark" size={16} color={Colors.success} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setEditingNode(null)} style={styles.nodeEditConfirm}>
                        <Ionicons name="close" size={16} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.nodeName}>{node.name}</Text>
                  )}
                  <View style={styles.nodeActions}>
                    <TouchableOpacity
                      style={styles.nodeActionBtn}
                      onPress={() => handleStartEditNode(levelIndex, node.id, node.name)}
                    >
                      <Ionicons name="pencil-outline" size={13} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.nodeActionBtn}
                      onPress={() => handleDeleteNode(levelIndex, node.id, node.name)}
                    >
                      <Ionicons name="trash-outline" size={13} color={Colors.error} />
                    </TouchableOpacity>
                    {hasNextLevel && (
                      <TouchableOpacity
                        style={[styles.nodeActionBtn, { borderColor: Colors.success + '50' }]}
                        onPress={() => handleAddNode(levelIndex + 1, node.id)}
                      >
                        <Ionicons name="add" size={13} color={Colors.success} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
              {/* Recurse into next level's children */}
              {hasNextLevel && renderNodeTree(levelIndex + 1, node.id, depth + 1)}
            </View>
          );
        })}
        {/* Add node button (same level, under parent) */}
        <TouchableOpacity
          style={[styles.addNodeBtn, { marginLeft: depth > 0 ? 20 : 0 }]}
          onPress={() => handleAddNode(levelIndex, parentId)}
        >
          <Ionicons name="add-circle-outline" size={15} color={Colors.primary} />
          <Text style={styles.addNodeBtnText}>
            Add {level.level_name}
            {parentId ? ' here' : ''}
          </Text>
        </TouchableOpacity>
        {/* Add inline node input */}
        {addingNodeForLevel === levelIndex && addingNodeParentId === parentId && (
          <View style={[styles.inlineInputRow, { marginLeft: depth > 0 ? 20 : 0 }]}>
            <TextInput
              style={styles.inlineInput}
              placeholder={`New ${level.level_name} name…`}
              placeholderTextColor={Colors.textMuted}
              value={newNodeName}
              onChangeText={setNewNodeName}
              autoFocus
              onSubmitEditing={handleConfirmAddNode}
            />
            <TouchableOpacity style={styles.inlineConfirmBtn} onPress={handleConfirmAddNode}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inlineCancelBtn}
              onPress={() => setAddingNodeForLevel(null)}
            >
              <Ionicons name="close" size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
      <Text style={styles.stepHeading}>Build your hierarchy</Text>
      <Text style={styles.stepSub}>
        Add levels (e.g. "Category", "Sub-category", "Type") and add names within each level. All items at the same level follow the same structure.
      </Text>

      {/* Levels */}
      {levels.map((level) => (
        <View key={level.level_index} style={styles.levelBlock}>
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>L{level.level_index + 1}</Text>
            </View>
            <Text style={styles.levelName}>{level.level_name}</Text>
            <TouchableOpacity
              style={styles.deleteLevelBtn}
              onPress={() => handleDeleteLevel(level.level_index)}
            >
              <Ionicons name="trash-outline" size={15} color={Colors.error} />
            </TouchableOpacity>
          </View>
          {/* Only render root nodes (parent_id === null) at the top level */}
          {level.level_index === 0 && renderNodeTree(0, null)}
        </View>
      ))}

      {/* Add Level */}
      {showAddLevel ? (
        <View style={styles.addLevelForm}>
          <Text style={styles.formLabel}>Level Name</Text>
          <View style={styles.inlineInputRow}>
            <TextInput
              style={styles.inlineInput}
              placeholder="e.g. Category, Sub-Type…"
              placeholderTextColor={Colors.textMuted}
              value={newLevelName}
              onChangeText={setNewLevelName}
              autoFocus
              onSubmitEditing={handleAddLevel}
            />
            <TouchableOpacity style={styles.inlineConfirmBtn} onPress={handleAddLevel}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inlineCancelBtn}
              onPress={() => setShowAddLevel(false)}
            >
              <Ionicons name="close" size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.addLevelBtn} onPress={() => setShowAddLevel(true)}>
          <Ionicons name="layers-outline" size={18} color={Colors.primary} />
          <Text style={styles.addLevelBtnText}>+ Add a Hierarchy Level</Text>
        </TouchableOpacity>
      )}

      {levels.length === 0 && (
        <View style={styles.emptyHint}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.emptyHintText}>
            Start by adding a level. For example: Level 1 = "Category", Level 2 = "Sub-Category".
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderStep3 = () => {
    const leafNodes = getLeafNodes();
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
        <Text style={styles.stepHeading}>Define product fields</Text>
        <Text style={styles.stepSub}>
          For each item in your deepest level, add the fields a product must have. Different items can have different fields.
        </Text>

        {leafNodes.length === 0 && (
          <View style={styles.emptyHint}>
            <Ionicons name="alert-circle-outline" size={20} color={Colors.amber} />
            <Text style={styles.emptyHintText}>
              No items found in the last level. Go back and add items to your hierarchy.
            </Text>
          </View>
        )}

        {leafNodes.map(({ node, levelIndex }) => (
          <View key={node.id} style={styles.leafCard}>
            <View style={styles.leafHeader}>
              <Ionicons name="pricetag-outline" size={16} color={Colors.primary} />
              <Text style={styles.leafName}>{node.name}</Text>
              <TouchableOpacity
                style={styles.addFieldBtn}
                onPress={() => openFieldModal(node, levelIndex)}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addFieldBtnText}>Add Field</Text>
              </TouchableOpacity>
            </View>

            {node.field_schema.length === 0 && (
              <Text style={styles.noFieldsText}>No fields yet. Tap "+ Add Field" to begin.</Text>
            )}

            {node.field_schema.map((field, fi) => (
              <View key={fi} style={styles.fieldRow}>
                <View style={styles.fieldIconBg}>
                  <Ionicons
                    name={FIELD_TYPES.find((t) => t.value === field.field_type)?.icon as any || 'text-outline'}
                    size={14}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.fieldMeta}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldMeta2}>
                    {field.field_type}
                    {field.unit ? ` · ${field.unit}` : ''}
                    {field.required ? ' · required' : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => openFieldModal(node, levelIndex, fi)}>
                  <Ionicons name="pencil-outline" size={15} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteField(node, levelIndex, fi)}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons name="trash-outline" size={15} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderStep4 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
      <Text style={styles.stepHeading}>Review & Save</Text>
      <Text style={styles.stepSub}>
        Here's a summary of your product structure. Tap "Save" to store it.
      </Text>

      {/* Top Category */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewSectionHeader}>
          <Ionicons name="storefront-outline" size={16} color={Colors.primary} />
          <Text style={styles.reviewSectionTitle}>Top Category</Text>
        </View>
        <View style={styles.reviewTopCat}>
          <Ionicons name={(topCategory?.icon || 'grid-outline') as any} size={24} color={Colors.primary} />
          <Text style={styles.reviewTopCatName}>{topCategory?.name}</Text>
        </View>
      </View>

      {/* Levels Summary */}
      {levels.map((level) => (
        <View key={level.level_index} style={styles.reviewSection}>
          <View style={styles.reviewSectionHeader}>
            <Ionicons name="layers-outline" size={16} color={Colors.purple} />
            <Text style={styles.reviewSectionTitle}>
              Level {level.level_index + 1} · {level.level_name}
            </Text>
          </View>
          {level.nodes.map((node) => (
            <View key={node.id} style={styles.reviewNode}>
              <View style={styles.reviewNodeLeft}>
                <Ionicons name="caret-forward" size={12} color={Colors.textMuted} />
                <Text style={styles.reviewNodeName}>{node.name}</Text>
              </View>
              {node.field_schema.length > 0 && (
                <View style={styles.reviewFieldBadge}>
                  <Text style={styles.reviewFieldBadgeText}>{node.field_schema.length} fields</Text>
                </View>
              )}
            </View>
          ))}
          {level.nodes.length === 0 && (
            <Text style={styles.reviewEmptyLevel}>No items in this level</Text>
          )}
        </View>
      ))}

      {levels.length === 0 && (
        <View style={styles.emptyHint}>
          <Text style={styles.emptyHintText}>No levels configured. Go back to add hierarchy levels.</Text>
        </View>
      )}
    </ScrollView>
  );

  // ── Field Modal ───────────────────────────────────────────────────────────

  const renderFieldModal = () => (
    <Modal visible={showFieldModal} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingFieldIndex !== null ? 'Edit Field' : 'New Field'}
              </Text>
              <TouchableOpacity onPress={() => setShowFieldModal(false)}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
              {/* Label */}
              <View style={styles.modalFormGroup}>
                <Text style={styles.formLabel}>Field Label *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Weight, Color, Brand…"
                  placeholderTextColor={Colors.textMuted}
                  value={fieldLabel}
                  onChangeText={setFieldLabel}
                />
              </View>

              {/* Field Type */}
              <View style={styles.modalFormGroup}>
                <Text style={styles.formLabel}>Field Type</Text>
                <View style={styles.fieldTypePicker}>
                  {FIELD_TYPES.map((ft) => (
                    <TouchableOpacity
                      key={ft.value}
                      style={[styles.fieldTypeChip, fieldType === ft.value && styles.fieldTypeChipActive]}
                      onPress={() => setFieldType(ft.value)}
                    >
                      <Ionicons
                        name={ft.icon as any}
                        size={14}
                        color={fieldType === ft.value ? '#fff' : Colors.textSecondary}
                      />
                      <Text
                        style={[styles.fieldTypeChipText, fieldType === ft.value && styles.fieldTypeChipTextActive]}
                      >
                        {ft.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Unit — shown for 'unit' type */}
              {fieldType === 'unit' && (
                <View style={styles.modalFormGroup}>
                  <Text style={styles.formLabel}>Unit</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. kg, cm, pcs…"
                    placeholderTextColor={Colors.textMuted}
                    value={fieldUnit}
                    onChangeText={setFieldUnit}
                  />
                  <View style={styles.unitSuggestions}>
                    {COMMON_UNITS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitChip, fieldUnit === u && styles.unitChipActive]}
                        onPress={() => setFieldUnit(u)}
                      >
                        <Text style={[styles.unitChipText, fieldUnit === u && styles.unitChipTextActive]}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Options — shown for 'dropdown' type */}
              {fieldType === 'dropdown' && (
                <View style={styles.modalFormGroup}>
                  <Text style={styles.formLabel}>Options (comma-separated)</Text>
                  <TextInput
                    style={[styles.formInput, { height: 70 }]}
                    placeholder="e.g. Red, Green, Blue"
                    placeholderTextColor={Colors.textMuted}
                    value={fieldOptions}
                    onChangeText={setFieldOptions}
                    multiline
                  />
                </View>
              )}

              {/* Required toggle */}
              <View style={styles.modalFormGroup}>
                <TouchableOpacity
                  style={styles.requiredRow}
                  onPress={() => setFieldRequired(!fieldRequired)}
                >
                  <View style={[styles.requiredToggle, fieldRequired && styles.requiredToggleOn]}>
                    {fieldRequired && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={styles.requiredLabel}>Required field</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.saveFieldBtn} onPress={handleSaveField}>
                <Text style={styles.saveFieldBtnText}>
                  {editingFieldIndex !== null ? 'Update Field' : 'Add Field'}
                </Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Product Structure</Text>
            <Text style={styles.headerStep}>{STEP_TITLES[currentStep]}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.stepIndicatorWrapper}>
          <StepIndicator current={currentStep} total={4} />
        </View>
      </SafeAreaView>

      {/* Step Content */}
      <View style={{ flex: 1 }}>
        {currentStep === 0 && renderStep1()}
        {currentStep === 1 && renderStep2()}
        {currentStep === 2 && renderStep3()}
        {currentStep === 3 && renderStep4()}
      </View>

      {/* Bottom Navigation */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
        <View style={styles.bottomNav}>
          {currentStep > 0 ? (
            <TouchableOpacity style={styles.prevBtn} onPress={goBack}>
              <Ionicons name="arrow-back" size={18} color={Colors.primary} />
              <Text style={styles.prevBtnText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 90 }} />
          )}

          <Text style={styles.stepCounter}>{currentStep + 1} / 4</Text>

          <TouchableOpacity
            style={[styles.nextBtn, !canGoNext() && styles.nextBtnDisabled, isSaving && styles.nextBtnDisabled]}
            onPress={goNext}
          >
            <Text style={styles.nextBtnText}>
              {currentStep === 3 ? (isSaving ? 'Saving…' : 'Save') : 'Next'}
            </Text>
            {currentStep < 3 && <Ionicons name="arrow-forward" size={18} color="#fff" />}
            {currentStep === 3 && !isSaving && <Ionicons name="checkmark" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {renderFieldModal()}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  headerSafe: { backgroundColor: Colors.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff' },
  headerStep: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  stepIndicatorWrapper: { paddingVertical: 14, backgroundColor: Colors.primary },

  // Step content
  stepContent: { padding: 20, paddingBottom: 40 },
  stepHeading: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.textPrimary, marginBottom: 6 },
  stepSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, lineHeight: 20, marginBottom: 20 },

  // Step 1 — Preset Grid
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  presetCard: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  presetCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  presetIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetIconBgSelected: { backgroundColor: Colors.primary },
  presetName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.textPrimary, textAlign: 'center' },
  presetNameSelected: { color: Colors.primary },
  checkBadge: { position: 'absolute', top: 8, right: 8 },
  customInputWrapper: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  customInput: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
  },
  confirmBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  confirmedText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.success },

  // Step 2 — Hierarchy
  levelBlock: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  levelBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadgeText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: Colors.primary },
  levelName: { flex: 1, fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.textPrimary },
  deleteLevelBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.error + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeRow: { flexDirection: 'row', alignItems: 'center', minHeight: 38, marginBottom: 4 },
  treeLines: { width: 24, alignItems: 'flex-start', position: 'relative', marginRight: 4 },
  treeLV: {
    position: 'absolute',
    left: 8,
    top: -10,
    bottom: 0,
    width: 1.5,
    backgroundColor: Colors.border,
  },
  treeLH: {
    position: 'absolute',
    left: 8,
    top: 19,
    width: 14,
    height: 1.5,
    backgroundColor: Colors.border,
  },
  nodeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  nodeName: { flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.textPrimary },
  nodeActions: { flexDirection: 'row', gap: 6 },
  nodeActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeEditRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  nodeEditInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingBottom: 2,
  },
  nodeEditConfirm: { padding: 4 },
  addNodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  addNodeBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.primary },
  inlineInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inlineInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
  },
  inlineConfirmBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineCancelBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addLevelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: Colors.primaryLight,
    marginTop: 4,
  },
  addLevelBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  addLevelForm: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF9EC',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  emptyHintText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, lineHeight: 18 },

  // Step 3 — Fields
  leafCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  leafHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  leafName: { flex: 1, fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.textPrimary },
  addFieldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addFieldBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  noFieldsText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textMuted, paddingVertical: 8 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  fieldIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldMeta: { flex: 1 },
  fieldLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.textPrimary },
  fieldMeta2: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textMuted, marginTop: 1 },

  // Step 4 — Review
  reviewSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  reviewSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  reviewSectionTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.textSecondary },
  reviewTopCat: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewTopCatName: { fontSize: 17, fontFamily: 'Inter_700Bold', color: Colors.textPrimary },
  reviewNode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  reviewNodeLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewNodeName: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textPrimary },
  reviewFieldBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reviewFieldBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  reviewEmptyLevel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textMuted, fontStyle: 'italic' },

  // Bottom nav
  bottomSafe: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Colors.border },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: 90,
    justifyContent: 'center',
  },
  prevBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  stepCounter: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textMuted },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: 110,
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#fff' },

  // Form common
  formLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.textPrimary, marginBottom: 8 },
  formInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,25,49,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 10,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: Colors.textPrimary },
  modalFormGroup: { marginTop: 18 },

  // Field type chips
  fieldTypePicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fieldTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#F5F7FA',
  },
  fieldTypeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  fieldTypeChipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  fieldTypeChipTextActive: { color: '#fff' },

  // Unit suggestions
  unitSuggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  unitChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F5F7FA',
  },
  unitChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  unitChipText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  unitChipTextActive: { color: '#fff' },

  // Required toggle
  requiredRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  requiredToggle: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requiredToggleOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  requiredLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.textPrimary },

  // Save field button
  saveFieldBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  saveFieldBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' },
});
